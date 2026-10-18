<?php

namespace App\Http\Controllers;

use App\Http\Requests\User\UpdateProfileRequest;
use App\Http\Resources\PostResource;
use App\Http\Resources\UserResource;
use App\Models\Reaction;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class UserController extends Controller
{
    /**
     * Display the specified user's public profile, stats, and published posts.
     */
    public function show(string $username): JsonResponse
    {
        $user = User::where('username', strtolower($username))
            ->withCount(['posts', 'comments', 'reactions'])
            ->first();

        if (! $user) {
            return response()->json([
                'status' => 'error',
                'message' => "Scholar or user '{$username}' not found.",
            ], 404);
        }

        // Fetch published posts with relations and counts
        $posts = $user->posts()
            ->where('status', 'published')
            ->with(['category:id,name,slug', 'media'])
            ->withCount(['comments', 'reactions', 'likes', 'insightfuls'])
            ->latest()
            ->get();

        // Calculate reputation / reaction stats received on this user's posts
        $userPostIds = $user->posts()->pluck('id');
        $reactionsReceived = Reaction::whereIn('post_id', $userPostIds)->get();

        $stats = [
            'published_posts_count' => $posts->count(),
            'total_comments_count' => $user->comments_count,
            'reactions_received_count' => $reactionsReceived->count(),
            'likes_received_count' => $reactionsReceived->where('type', 'like')->count(),
            'insightfuls_received_count' => $reactionsReceived->where('type', 'insightful')->count(),
        ];

        return response()->json([
            'status' => 'success',
            'user' => new UserResource($user),
            'stats' => $stats,
            'posts' => PostResource::collection($posts),
        ]);
    }

    /**
     * Update the authenticated user's profile details and avatar.
     */
    public function updateProfile(UpdateProfileRequest $request): JsonResponse
    {
        $user = $request->user();
        $validated = $request->validated();

        // Handle avatar upload / replacement
        if ($request->hasFile('avatar')) {
            $file = $request->file('avatar');

            // Delete old avatar from disk if it was stored locally
            if ($user->avatar && ! str_starts_with($user->avatar, 'http://') && ! str_starts_with($user->avatar, 'https://')) {
                Storage::disk('public')->delete($user->avatar);
            }

            // Store new avatar in public disk under 'avatars/'
            $filename = 'avatar_' . $user->id . '_' . time() . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs('avatars', $filename, 'public');
            $user->avatar = $path;
        }

        if (isset($validated['name'])) {
            $user->name = $validated['name'];
        }

        if (array_key_exists('bio', $validated)) {
            $user->bio = $validated['bio'];
        }

        $user->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Profile updated successfully.',
            'user' => new UserResource($user),
        ]);
    }
}
