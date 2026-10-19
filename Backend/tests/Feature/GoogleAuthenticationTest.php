<?php

namespace Tests\Feature;

use App\Models\User;
use Firebase\JWT\JWT;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class GoogleAuthenticationTest extends TestCase
{
    use RefreshDatabase;

    private function credential(array $overrides = [], bool $invalidSignature = false): string
    {
        config(['services.google.client_id' => 'test-client.apps.googleusercontent.com']);
        Http::preventStrayRequests();
        $key = openssl_pkey_new(['private_key_bits' => 2048, 'private_key_type' => OPENSSL_KEYTYPE_RSA]);
        $details = openssl_pkey_get_details($key);
        Http::fake(['https://www.googleapis.com/oauth2/v3/certs' => Http::response(['keys' => [[
            'kty' => 'RSA', 'alg' => 'RS256', 'kid' => 'test-key',
            'n' => JWT::urlsafeB64Encode($details['rsa']['n']),
            'e' => JWT::urlsafeB64Encode($details['rsa']['e']),
        ]]])]);
        if ($invalidSignature) {
            $key = openssl_pkey_new(['private_key_bits' => 2048, 'private_key_type' => OPENSSL_KEYTYPE_RSA]);
        }
        openssl_pkey_export($key, $privateKey);

        return JWT::encode(array_merge([
            'iss' => 'https://accounts.google.com',
            'aud' => 'test-client.apps.googleusercontent.com',
            'sub' => 'google-subject-123',
            'exp' => time() + 3600,
            'iat' => time() - 10,
            'email' => 'reader@gmail.com',
            'email_verified' => true,
            'name' => 'Curious Reader',
        ], $overrides), $privateKey, 'RS256', 'test-key');
    }

    public function test_google_creates_an_account_with_a_reusable_session_token(): void
    {
        $credential = $this->credential();
        $response = $this->postJson('/api/auth/google', ['credential' => $credential, 'role' => 'admin']);
        $response->assertOk()->assertJsonPath('user.email', 'reader@gmail.com')->assertJsonPath('user.role', 'user');
        $this->assertDatabaseHas('users', ['google_id' => 'google-subject-123', 'email' => 'reader@gmail.com']);
        $this->assertDatabaseCount('users', 1);
        Http::assertSentCount(1);
        $this->withToken($response->json('token'))->getJson('/api/auth/me')->assertOk()->assertJsonPath('user.name', 'Curious Reader');
        $this->assertDatabaseHas('personal_access_tokens', ['expires_at' => null]);
    }

    public function test_returning_google_user_is_found_by_subject_even_if_email_changes(): void
    {
        $user = User::factory()->create(['email' => 'old@gmail.com']);
        $user->forceFill(['google_id' => 'google-subject-123'])->save();
        $credential = $this->credential();
        $this->postJson('/api/auth/google', ['credential' => $credential])->assertOk()->assertJsonPath('user.id', $user->id);
        $this->assertDatabaseCount('users', 1);
        Http::assertSentCount(1);
    }

    public function test_verified_gmail_can_sign_in_to_existing_email_account(): void
    {
        $user = User::factory()->create(['email' => 'reader@gmail.com']);
        $credential = $this->credential();
        $this->postJson('/api/auth/google', ['credential' => $credential])->assertOk()->assertJsonPath('user.id', $user->id);
        $this->assertSame('google-subject-123', $user->fresh()->google_id);
        Http::assertSentCount(1);
    }

    public function test_third_party_google_email_cannot_take_over_an_existing_account(): void
    {
        $user = User::factory()->create(['email' => 'reader@example.com']);
        $credential = $this->credential(['email' => $user->email]);
        $this->postJson('/api/auth/google', ['credential' => $credential])->assertUnprocessable()->assertJsonValidationErrors('credential');
        $this->assertNull($user->fresh()->google_id);
        $this->assertDatabaseCount('personal_access_tokens', 0);
        Http::assertSentCount(1);
    }

    public static function invalidClaims(): array
    {
        return [
            'other audience' => [['aud' => 'another-client']],
            'other issuer' => [['iss' => 'https://attacker.example']],
            'expired' => [['exp' => 1]],
            'missing subject' => [['sub' => '']],
            'unverified email' => [['email_verified' => false]],
            'missing email' => [['email' => '']],
        ];
    }

    #[DataProvider('invalidClaims')]
    public function test_invalid_google_identity_is_rejected(array $claims): void
    {
        $credential = $this->credential($claims);
        $this->postJson('/api/auth/google', ['credential' => $credential])->assertUnprocessable()->assertJsonValidationErrors('credential');
        $this->assertDatabaseCount('users', 0);
        $this->assertDatabaseCount('personal_access_tokens', 0);
        Http::assertSentCount(1);
    }

    public function test_forged_google_signature_is_rejected(): void
    {
        $credential = $this->credential(invalidSignature: true);
        $this->postJson('/api/auth/google', ['credential' => $credential])->assertUnprocessable();
        $this->assertDatabaseCount('personal_access_tokens', 0);
        Http::assertSentCount(1);
    }

    public function test_google_configuration_is_required(): void
    {
        config(['services.google.client_id' => null]);
        $this->postJson('/api/auth/google', ['credential' => 'untrusted'])->assertStatus(503);
        $this->assertDatabaseCount('users', 0);
    }

    public function test_google_outage_does_not_create_a_session(): void
    {
        config(['services.google.client_id' => 'test-client']);
        Http::preventStrayRequests();
        Http::fake(['https://www.googleapis.com/oauth2/v3/certs' => Http::response([], 503)]);
        $this->postJson('/api/auth/google', ['credential' => 'untrusted'])->assertStatus(503);
        $this->assertDatabaseCount('personal_access_tokens', 0);
        Http::assertSentCount(1);
    }

    public function test_guests_can_browse_but_cannot_write(): void
    {
        $this->getJson('/api/posts')->assertOk();
        $this->getJson('/api/categories')->assertOk();
        foreach (['/api/posts', '/api/posts/1/comments', '/api/posts/1/reactions', '/api/reports', '/api/user/profile'] as $path) {
            $this->postJson($path, [])->assertUnauthorized();
        }
    }
}
