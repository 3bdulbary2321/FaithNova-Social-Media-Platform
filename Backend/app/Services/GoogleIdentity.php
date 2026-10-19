<?php

namespace App\Services;

use Firebase\JWT\JWK;
use Google\Auth\OAuth2;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Validation\ValidationException;

class GoogleIdentity
{
    /** @return array<string, mixed> */
    public function verify(string $credential): array
    {
        $clientId = config('services.google.client_id');
        abort_unless($clientId, 503, 'Google sign-in is not configured. Please use email.');

        try {
            $certificates = Cache::remember('google-sign-in-certificates', 3600, fn () => Http::timeout(8)
                ->get('https://www.googleapis.com/oauth2/v3/certs')->throw()->json());
            $verifier = new OAuth2(['audience' => $clientId]);
            $verifier->setIdToken($credential);
            $payload = (array) $verifier->verifyIdToken(JWK::parseKeySet($certificates, 'RS256'));
        } catch (\Throwable $exception) {
            if ($exception instanceof ConnectionException || $exception instanceof RequestException) {
                abort(503, 'Google sign-in is temporarily unavailable. Please try again or use email.');
            }
            throw ValidationException::withMessages(['credential' => ['Google could not verify this sign-in. Please try again.']]);
        }

        if (! in_array($payload['iss'] ?? '', ['accounts.google.com', 'https://accounts.google.com'], true)
            || empty($payload['sub']) || ! is_string($payload['sub'])
            || ($payload['exp'] ?? 0) <= time()
            || ($payload['email_verified'] ?? false) !== true
            || ! filter_var($payload['email'] ?? '', FILTER_VALIDATE_EMAIL)) {
            throw ValidationException::withMessages(['credential' => ['A verified Google account is required.']]);
        }

        return $payload;
    }
}
