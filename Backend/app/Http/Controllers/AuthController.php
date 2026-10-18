<?php

namespace App\Http\Controllers;

use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Register a new user and generate a Sanctum API token.
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $user = User::create([
            'name' => $validated['name'],
            'username' => strtolower($validated['username']),
            'email' => strtolower($validated['email']),
            'password' => Hash::make($validated['password']),
            'bio' => $validated['bio'] ?? null,
            'avatar' => $validated['avatar'] ?? null,
            'role' => 'user',
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'status' => 'success',
            'message' => 'Account registered successfully.',
            'token' => $token,
            'token_type' => 'Bearer',
            'user' => new UserResource($user),
        ], 201);
    }

    /**
     * Authenticate an existing user and return a Sanctum API token.
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $loginIdentifier = $validated['login'] ?? $validated['email'] ?? $validated['username'];

        // Support authentication via either email or username
        $user = User::where('email', strtolower($loginIdentifier))
            ->orWhere('username', strtolower($loginIdentifier))
            ->first();

        if (! $user || ! Hash::check($validated['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials do not match our records.'],
            ]);
        }

        $deviceName = $validated['device_name'] ?? 'faithnova_spa_client';
        $token = $user->createToken($deviceName)->plainTextToken;

        return response()->json([
            'status' => 'success',
            'message' => 'Logged in successfully.',
            'token' => $token,
            'token_type' => 'Bearer',
            'user' => new UserResource($user),
        ]);
    }

    /**
     * Get the authenticated user's profile with aggregated counts.
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user()->loadCount(['posts', 'comments', 'reactions']);

        return response()->json([
            'status' => 'success',
            'user' => new UserResource($user),
        ]);
    }

    /**
     * Revoke the current access token for logout.
     */
    public function logout(Request $request): JsonResponse
    {
        $token = $request->user()?->currentAccessToken();

        if ($token) {
            $token->delete();
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Token revoked successfully. Logged out.',
        ]);
    }
}
