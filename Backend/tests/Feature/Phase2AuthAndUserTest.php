<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class Phase2AuthAndUserTest extends TestCase
{
    use RefreshDatabase;
    /**
     * Test user registration with valid data.
     */
    public function test_user_can_register_successfully(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'name' => 'Dr. Layla Hakeem',
            'username' => 'layla_hakeem',
            'email' => 'layla@faithnova.com',
            'password' => 'password123',
            'bio' => 'Neurobiologist researching synaptic plasticity.',
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'status',
                'message',
                'token',
                'token_type',
                'user' => [
                    'id',
                    'name',
                    'username',
                    'email',
                    'role',
                    'bio',
                ],
            ]);

        $this->assertDatabaseHas('users', [
            'username' => 'layla_hakeem',
            'email' => 'layla@faithnova.com',
            'role' => 'user',
        ]);
    }

    /**
     * Test registration validation errors.
     */
    public function test_registration_requires_valid_data(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'name' => '',
            'username' => 'ab', // too short
            'email' => 'not-an-email',
            'password' => '123', // too short
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'username', 'email', 'password']);
    }

    /**
     * Test login with email and with username.
     */
    public function test_user_can_login_with_email_or_username(): void
    {
        $user = User::factory()->create([
            'username' => 'galileo_g',
            'email' => 'galileo@faithnova.com',
            'password' => 'telescope123',
            'role' => 'user',
        ]);

        // Login with email
        $emailLogin = $this->postJson('/api/auth/login', [
            'login' => 'galileo@faithnova.com',
            'password' => 'telescope123',
        ]);

        $emailLogin->assertStatus(200)
            ->assertJsonStructure(['status', 'token', 'user']);

        // Login with username
        $userLogin = $this->postJson('/api/auth/login', [
            'login' => 'galileo_g',
            'password' => 'telescope123',
        ]);

        $userLogin->assertStatus(200)
            ->assertJsonStructure(['status', 'token', 'user']);
    }

    /**
     * Test failed login.
     */
    public function test_login_fails_with_invalid_credentials(): void
    {
        $response = $this->postJson('/api/auth/login', [
            'login' => 'nonexistent@faithnova.com',
            'password' => 'wrongpassword',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    /**
     * Test 'me' endpoint returns authenticated user.
     */
    public function test_me_endpoint_returns_authenticated_user(): void
    {
        $user = User::factory()->create([
            'username' => 'ibnsina',
            'role' => 'user',
        ]);

        $response = $this->actingAs($user)->getJson('/api/auth/me');

        $response->assertStatus(200)
            ->assertJsonPath('user.username', 'ibnsina');
    }

    /**
     * Test logout revokes token.
     */
    public function test_user_can_logout_and_revoke_token(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test_token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/auth/logout');

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success');

        $this->assertCount(0, $user->fresh()->tokens);
    }

    /**
     * Test public user profile show($username).
     */
    public function test_can_view_public_profile(): void
    {
        $user = User::factory()->create([
            'username' => 'copernicus',
            'name' => 'Nicolaus Copernicus',
            'bio' => 'Heliocentrism pioneer.',
        ]);

        $response = $this->getJson('/api/users/copernicus');

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('user.name', 'Nicolaus Copernicus')
            ->assertJsonStructure([
                'status',
                'user',
                'stats' => [
                    'published_posts_count',
                    'reactions_received_count',
                ],
                'posts',
            ]);
    }

    /**
     * Test profile update with avatar file upload.
     */
    public function test_authenticated_user_can_update_profile_and_avatar(): void
    {
        Storage::fake('public');

        $user = User::factory()->create([
            'name' => 'Original Name',
            'bio' => 'Original Bio',
        ]);

        $fakeAvatar = UploadedFile::fake()->image('avatar.jpg', 200, 200);

        $response = $this->actingAs($user)->postJson('/api/user/profile', [
            'name' => 'Updated Name',
            'bio' => 'Updated Academic Bio',
            'avatar' => $fakeAvatar,
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('user.name', 'Updated Name')
            ->assertJsonPath('user.bio', 'Updated Academic Bio');

        $user->refresh();
        $this->assertEquals('Updated Name', $user->name);
        $this->assertEquals('Updated Academic Bio', $user->bio);
        $this->assertNotNull($user->avatar);
        Storage::disk('public')->assertExists($user->avatar);
    }

    /**
     * Test RoleMiddleware restricts access based on role.
     */
    public function test_role_middleware_restricts_unauthorized_roles(): void
    {
        $normalUser = User::factory()->create(['role' => 'user']);
        $adminUser = User::factory()->create(['role' => 'admin']);

        // Normal user should be rejected with 403 Forbidden
        $responseUser = $this->actingAs($normalUser)->getJson('/api/moderation/ping');
        $responseUser->assertStatus(403)
            ->assertJsonPath('status', 'error')
            ->assertJsonPath('message', 'Forbidden. You do not have permission to access this resource.');

        // Admin user should be accepted with 200 OK
        $responseAdmin = $this->actingAs($adminUser)->getJson('/api/moderation/ping');
        $responseAdmin->assertStatus(200)
            ->assertJsonPath('status', 'success');
    }
}
