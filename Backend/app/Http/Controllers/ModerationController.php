<?php

namespace App\Http\Controllers;

use App\Http\Resources\PostResource;
use App\Http\Resources\ReportResource;
use App\Models\Comment;
use App\Models\Post;
use App\Models\Report;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ModerationController extends Controller
{
    /**
     * Retrieve aggregate metrics for the moderation dashboard.
     */
    public function stats(): JsonResponse
    {
        $stats = [
            'pending_posts_count' => Post::where('status', 'pending')->count(),
            'pending_reports_count' => Report::where('status', 'pending')->count(),
            'total_users_count' => User::count(),
            'total_published_posts_count' => Post::where('status', 'published')->count(),
            'total_moderators_count' => User::whereIn('role', ['moderator', 'admin'])->count(),
            'reviewed_reports_count' => Report::whereIn('status', ['reviewed', 'dismissed'])->count(),
        ];

        return response()->json([
            'status' => 'success',
            'data' => $stats,
        ]);
    }

    /**
     * Retrieve a paginated queue of pending submissions awaiting review.
     */
    public function pendingPosts(Request $request): JsonResponse
    {
        $perPage = (int) $request->input('per_page', 10);

        $posts = Post::where('status', 'pending')
            ->with(['user', 'category', 'media'])
            ->withCount(['comments', 'reactions', 'likes', 'insightfuls'])
            ->latest('id')
            ->paginate($perPage);

        return response()->json([
            'status' => 'success',
            'data' => PostResource::collection($posts)->response()->getData(true),
        ]);
    }

    /**
     * Update the moderation status of a post ('published' or 'rejected').
     */
    public function updatePostStatus(Request $request, Post $post): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'string', 'in:published,rejected'],
            'feedback' => ['nullable', 'string', 'max:1000'],
        ]);

        $post->update([
            'status' => $validated['status'],
        ]);

        return response()->json([
            'status' => 'success',
            'message' => "Post #{$post->id} status updated to '{$validated['status']}'.",
            'data' => new PostResource($post->fresh(['user', 'category', 'media'])->loadCount(['comments', 'reactions', 'likes', 'insightfuls'])),
        ]);
    }

    /**
     * Retrieve a paginated list of content reports with reporters and target content.
     */
    public function reports(Request $request): JsonResponse
    {
        $query = Report::with(['reporter', 'reportable.user']);

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        $perPage = (int) $request->input('per_page', 10);
        $reports = $query->latest('id')->paginate($perPage);

        return response()->json([
            'status' => 'success',
            'data' => ReportResource::collection($reports)->response()->getData(true),
        ]);
    }

    /**
     * Resolve a content report by either dismissing it or deleting the offending content.
     */
    public function resolveReport(Request $request, Report $report): JsonResponse
    {
        $validated = $request->validate([
            'action' => ['required', 'string', 'in:dismiss,delete_content'],
            'moderator_notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $action = $validated['action'];

        if ($action === 'dismiss') {
            $report->update([
                'status' => 'dismissed',
                'notes' => $validated['moderator_notes'] ?? $report->notes,
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Report dismissed as non-violating.',
                'data' => new ReportResource($report->fresh(['reporter', 'reportable.user'])),
            ]);
        }

        // Action: 'delete_content'
        $item = $report->reportable;

        if ($item instanceof Post) {
            // Delete associated physical media files from public disk
            foreach ($item->media as $mediaItem) {
                if (! str_starts_with($mediaItem->file_path, 'http://') && ! str_starts_with($mediaItem->file_path, 'https://')) {
                    Storage::disk('public')->delete($mediaItem->file_path);
                }
            }
            $item->delete();
        } elseif ($item instanceof Comment) {
            $item->delete();
        }

        $report->update([
            'status' => 'reviewed',
            'notes' => $validated['moderator_notes'] ?? $report->notes,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Offending content removed and report marked as reviewed.',
            'data' => new ReportResource($report->fresh(['reporter'])),
        ]);
    }
}
