<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Models\Reaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReactionController extends Controller
{
    /**
     * Toggle or update a reaction ('like' or 'insightful') on the specified post.
     */
    public function toggle(Request $request, Post $post): JsonResponse
    {
        $validated = $request->validate([
            'type' => ['required', 'string', 'in:like,insightful'],
        ]);

        $userId = $request->user()->id;
        $type = $validated['type'];

        $existingReaction = Reaction::where('post_id', $post->id)
            ->where('user_id', $userId)
            ->first();

        if (! $existingReaction) {
            // Case 1: Create new reaction
            Reaction::create([
                'post_id' => $post->id,
                'user_id' => $userId,
                'type' => $type,
            ]);
            $action = 'added';
            $userReaction = $type;
        } elseif ($existingReaction->type === $type) {
            // Case 2: User clicked the same reaction -> un-react / remove
            $existingReaction->delete();
            $action = 'removed';
            $userReaction = null;
        } else {
            // Case 3: User changed reaction type (e.g., from 'like' to 'insightful')
            $existingReaction->update(['type' => $type]);
            $action = 'updated';
            $userReaction = $type;
        }

        // Recalculate fresh reaction stats for the post
        $likesCount = $post->reactions()->where('type', 'like')->count();
        $insightfulsCount = $post->reactions()->where('type', 'insightful')->count();
        $totalCount = $likesCount + $insightfulsCount;

        return response()->json([
            'status' => 'success',
            'action' => $action,
            'user_reaction' => $userReaction,
            'stats' => [
                'likes_count' => $likesCount,
                'insightfuls_count' => $insightfulsCount,
                'reactions_count' => $totalCount,
            ],
        ]);
    }
}
