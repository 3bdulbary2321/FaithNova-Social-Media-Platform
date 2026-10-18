<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

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

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
