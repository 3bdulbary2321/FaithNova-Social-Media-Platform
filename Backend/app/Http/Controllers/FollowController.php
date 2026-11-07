<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FollowController extends Controller
{
    /**
     * Follow or unfollow another member.
     */
    public function toggle(Request $request, User $user): JsonResponse
    {
        $follower = $request->user();

        if ($user->is($follower)) {
            return response()->json([
                'status' => 'error',
                'message' => 'You cannot follow yourself.',
            ], 422);
        }

        $result = $follower->following()->toggle($user->id);
        $isFollowing = ! empty($result['attached']);

        return response()->json([
            'status' => 'success',
            'following' => $isFollowing,
            'followers_count' => $user->followers()->count(),
        ]);
    }
}
