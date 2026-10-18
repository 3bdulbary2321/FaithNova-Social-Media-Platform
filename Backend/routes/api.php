<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| FaithNova API Routes
|--------------------------------------------------------------------------
*/

// Health & System Status
Route::get('/status', function () {
    try {
        \Illuminate\Support\Facades\DB::connection()->getPdo();
        $dbStatus = 'connected';
        $databaseName = \Illuminate\Support\Facades\DB::connection()->getDatabaseName();
    } catch (\Throwable $e) {
        $dbStatus = 'error: ' . $e->getMessage();
        $databaseName = null;
    }

    return response()->json([
        'status' => 'success',
        'message' => 'FaithNova Backend API is running smoothly',
        'laravel_version' => app()->version(),
        'php_version' => PHP_VERSION,
        'database' => [
            'status' => $dbStatus,
            'name' => $databaseName,
            'driver' => config('database.default'),
        ],
        'timestamp' => now()->toISOString(),
    ]);
});

// --------------------------------------------------------------------------
// Authentication Routes (Laravel Sanctum)
// --------------------------------------------------------------------------
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'logout']);
    });
});

// --------------------------------------------------------------------------
// User Profiles & Account Management
// --------------------------------------------------------------------------
// Public User Profile & Published Posts
Route::get('/users/{username}', [UserController::class, 'show']);

// Authenticated User Profile Management (supports POST with multipart/form-data file uploads and PUT)
Route::middleware('auth:sanctum')->group(function () {
    Route::match(['post', 'put'], '/user/profile', [UserController::class, 'updateProfile']);
    
    // Legacy / shortcut endpoint
    Route::get('/user', [AuthController::class, 'me']);
});

// --------------------------------------------------------------------------
// Role-Protected Demonstration Endpoints (Admin & Moderator RBAC)
// --------------------------------------------------------------------------
Route::middleware(['auth:sanctum', 'role:admin,moderator'])->prefix('moderation')->group(function () {
    Route::get('/ping', function (Request $request) {
        return response()->json([
            'status' => 'success',
            'message' => 'Role authorization verified: You have staff privileges.',
            'user' => [
                'name' => $request->user()->name,
                'role' => $request->user()->role,
            ],
        ]);
    });
});
