<?php

use App\Http\Controllers\Auth\SpaAuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user()->only(['id', 'name', 'email']);
});

Route::middleware('auth:sanctum')->get('/members/secret', function (Request $request) {
    return [
        'message' => '認証済みユーザーのみが取得できるレスポンスです。',
        'issued_at' => now()->toIso8601String(),
        'user' => $request->user()->only(['id', 'name', 'email']),
    ];
});

Route::post('/login', [SpaAuthController::class, 'login']);
Route::post('/register', [SpaAuthController::class, 'register']);
Route::post('/logout', [SpaAuthController::class, 'logout'])->middleware('auth:sanctum');
