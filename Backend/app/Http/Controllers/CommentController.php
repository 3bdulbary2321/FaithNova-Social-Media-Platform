<?php

namespace App\Http\Controllers;

use App\Http\Requests\Comment\StoreCommentRequest;
use App\Http\Resources\CommentResource;
use App\Models\Comment;
use App\Models\Post;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CommentController extends Controller
{
    /**
     * Store a newly created comment or nested reply for the specified post.
     */
    public function store(StoreCommentRequest $request, Post $post): JsonResponse
    {
        $validated = $request->validated();
        $parentId = $validated['parent_id'] ?? null;

        // Ensure parent_id belongs to the exact same post to prevent cross-post reply discrepancies
        if ($parentId) {
            $parent = Comment::where('id', $parentId)
                ->where('post_id', $post->id)
                ->first();

            if (! $parent) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'The parent comment does not belong to this post or does not exist.',
                    'errors' => [
                        'parent_id' => ['The specified parent comment is not associated with this post.'],
                    ],
                ], 422);
            }
        }

        $comment = Comment::create([
            'post_id' => $post->id,
            'user_id' => $request->user()->id,
            'parent_id' => $parentId,
            'content' => $validated['content'],
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Comment posted successfully.',
            'data' => new CommentResource($comment->load(['user', 'replies'])),
        ], 201);
    }

    /**
     * Update the specified comment (Owner only).
     */
    public function update(Request $request, Comment $comment): JsonResponse
    {
        $user = $request->user();

        // Only author can update their comment content
        if ($user->id !== $comment->user_id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Forbidden. Only the author can modify this comment.',
            ], 403);
        }

        $validated = $request->validate([
            'content' => ['required', 'string', 'min:2', 'max:5000'],
        ]);

        $comment->update([
            'content' => $validated['content'],
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Comment updated successfully.',
            'data' => new CommentResource($comment->load(['user', 'replies'])),
        ]);
    }

    /**
     * Remove the specified comment from storage (Owner or Moderator/Admin).
     */
    public function destroy(Request $request, Comment $comment): JsonResponse
    {
        $user = $request->user();

        if ($user->id !== $comment->user_id && ! $user->isModerator()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Forbidden. You do not have permission to delete this comment.',
            ], 403);
        }

        $comment->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Comment deleted successfully.',
        ]);
    }
}
