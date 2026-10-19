<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\ModerationController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\ReactionController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| FaithNova RESTful API Routes
|--------------------------------------------------------------------------
|
| Organized into:
|  1. Public Routes (No authentication required)
|  2. Authenticated Routes (Requires Bearer token via Laravel Sanctum)
|  3. Moderation & Staff Routes (Requires 'admin' or 'moderator' RBAC role)
|
*/

// =========================================================================
// 1. PUBLIC ROUTES (Guests & Readers)
// =========================================================================

// Health check & Database connectivity status
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

// Authentication (Registration & Login)
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
});

// Academic & Spiritual Categories (Public Browsing)
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{slug}/posts', [CategoryController::class, 'posts']);

// Posts Feed, Full-Text Search & Post Details
Route::get('/posts', [PostController::class, 'index']);
Route::get('/posts/search', [PostController::class, 'search']);
Route::get('/posts/{id}', [PostController::class, 'show']);

// Public Scholar / User Profiles & Published Portfolios
Route::get('/users/{username}', [UserController::class, 'show']);


// =========================================================================
// 2. AUTHENTICATED USER ROUTES (Requires Sanctum Token)
// =========================================================================
Route::middleware('auth:sanctum')->group(function () {

    // Identity & Session Management
    Route::prefix('auth')->group(function () {
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'logout']);
    });
    Route::get('/user', [AuthController::class, 'me']); // Convenient shortcut

    // Profile Management (Supports multipart file uploads for avatar)
    Route::match(['post', 'put'], '/user/profile', [UserController::class, 'updateProfile']);

    // Post Authoring & Management
    Route::post('/posts', [PostController::class, 'store']);
    Route::match(['post', 'put'], '/posts/{post}', [PostController::class, 'update']);
    Route::delete('/posts/{post}', [PostController::class, 'destroy']);

    // Nested Comments & Scholarly Discussions
    Route::post('/posts/{post}/comments', [CommentController::class, 'store']);
    Route::put('/comments/{comment}', [CommentController::class, 'update']);
    Route::delete('/comments/{comment}', [CommentController::class, 'destroy']);

    // Reactions Engine ('like' or 'insightful')
    Route::post('/posts/{post}/reactions', [ReactionController::class, 'toggle']);
    Route::post('/posts/{post}/react', [ReactionController::class, 'toggle']);

    // Content Reporting (Polymorphic: Posts & Comments)
    Route::post('/reports', [ReportController::class, 'store']);
});


// =========================================================================
// 3. MODERATION & STAFF ROUTES (Admin & Moderator RBAC)
// =========================================================================
Route::middleware(['auth:sanctum', 'role:admin,moderator'])->prefix('moderation')->group(function () {
    
    // Staff RBAC Verification & Ping
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

    // Dashboard Aggregate Statistics
    Route::get('/stats', [ModerationController::class, 'stats']);

    // Submissions Review Queue
    Route::get('/posts/pending', [ModerationController::class, 'pendingPosts']);
    Route::match(['patch', 'put'], '/posts/{post}/status', [ModerationController::class, 'updatePostStatus']);

    // Content Reports Queue & Resolution
    Route::get('/reports', [ModerationController::class, 'reports']);
    Route::post('/reports/{report}/resolve', [ModerationController::class, 'resolveReport']);
});

// Category Administration (Admin only)
Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
    Route::post('/categories', [CategoryController::class, 'store']);
    Route::put('/categories/{category}', [CategoryController::class, 'update']);
    Route::delete('/categories/{category}', [CategoryController::class, 'destroy']);
});
