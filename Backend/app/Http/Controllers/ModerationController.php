<?php

namespace App\Http\Controllers;

use App\Http\Resources\PostResource;
use App\Http\Resources\ReportResource;
use App\Http\Resources\UserResource;
use App\Models\Category;
use App\Models\Comment;
use App\Models\Post;
use App\Models\Report;
use App\Models\User;
use App\Notifications\ModerationNotice;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

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
     * Everything the moderation dashboard home screen needs in one request:
     * headline counters, chart series, top accounts and who is online.
     */
    public function overview(Request $request): JsonResponse
    {
        $days = min(max((int) $request->input('days', 14), 7), 90);
        $since = now()->subDays($days - 1)->startOfDay();

        $postsByCategory = Category::query()
            ->withCount([
                'posts' => fn ($query) => $query->where('status', 'published'),
                'posts as pending_posts_count' => fn ($query) => $query->where('status', 'pending'),
            ])
            ->orderByDesc('posts_count')
            ->get(['id', 'name', 'slug'])
            ->map(fn (Category $category) => [
                'id' => $category->id,
                'name' => $category->name,
                'slug' => $category->slug,
                'posts_count' => $category->posts_count,
                'pending_posts_count' => $category->pending_posts_count,
            ]);

        $topFollowed = User::query()
            ->withCount(['followers', 'posts'])
            ->orderByDesc('followers_count')
            ->orderByDesc('posts_count')
            ->limit(5)
            ->get();

        $activeUsers = User::query()
            ->activeWithin(15)
            ->withLastActiveAt()
            ->orderByDesc('last_active_at')
            ->limit(8)
            ->get();

        $topPosters = User::query()
            ->withCount(['posts' => fn ($query) => $query->where('status', 'published')])
            ->whereHas('posts', fn ($query) => $query->where('status', 'published'))
            ->orderByDesc('posts_count')
            ->limit(5)
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => [
                'stats' => [
                    'total_users_count' => User::count(),
                    'active_users_count' => User::activeWithin(15)->count(),
                    'blocked_users_count' => User::whereNotNull('blocked_at')->count(),
                    'new_users_count' => User::where('created_at', '>=', $since)->count(),
                    'total_published_posts_count' => Post::where('status', 'published')->count(),
                    'pending_posts_count' => Post::where('status', 'pending')->count(),
                    'pending_reports_count' => Report::where('status', 'pending')->count(),
                    'reviewed_reports_count' => Report::whereIn('status', ['reviewed', 'dismissed'])->count(),
                    'total_comments_count' => Comment::count(),
                    'total_follows_count' => DB::table('follows')->count(),
                ],
                'reports_by_status' => Report::query()
                    ->select('status', DB::raw('count(*) as total'))
                    ->groupBy('status')
                    ->pluck('total', 'status'),
                'posts_by_category' => $postsByCategory,
                'activity' => $this->dailyActivity($since, $days),
                'top_followed' => UserResource::collection($topFollowed),
                'top_posters' => UserResource::collection($topPosters),
                'active_users' => UserResource::collection($activeUsers),
            ],
        ]);
    }

    /**
     * Build a per-day series of new posts, reports and sign-ups with zero-filled gaps.
     *
     * @return list<array{date: string, posts: int, reports: int, users: int}>
     */
    protected function dailyActivity(Carbon $since, int $days): array
    {
        $countPerDay = fn (string $table) => DB::table($table)
            ->where('created_at', '>=', $since)
            ->selectRaw('DATE(created_at) as day, count(*) as total')
            ->groupBy('day')
            ->pluck('total', 'day');

        $posts = $countPerDay('posts');
        $reports = $countPerDay('reports');
        $users = $countPerDay('users');

        return collect(range(0, $days - 1))
            ->map(function (int $offset) use ($since, $posts, $reports, $users) {
                $day = $since->copy()->addDays($offset)->toDateString();

                return [
                    'date' => $day,
                    'posts' => (int) ($posts[$day] ?? 0),
                    'reports' => (int) ($reports[$day] ?? 0),
                    'users' => (int) ($users[$day] ?? 0),
                ];
            })
            ->all();
    }

    /**
     * Remove any post (reported or not) and tell its author why.
     */
    public function destroyPost(Request $request, Post $post): JsonResponse
    {
        $validated = $request->validate([
            'reason' => ['nullable', 'string', 'max:1000'],
            'notify_author' => ['sometimes', 'boolean'],
        ]);

        $author = $post->user;
        $title = $post->title;

        $this->deletePostWithMedia($post);

        Report::where('reportable_type', Post::class)
            ->where('reportable_id', $post->id)
            ->where('status', 'pending')
            ->update(['status' => 'reviewed']);

        if ($author && ($validated['notify_author'] ?? true)) {
            $author->notify(new ModerationNotice(
                title: 'Your post was removed',
                body: $this->removalMessage('post "'.Str::limit($title, 80).'"', $validated['reason'] ?? null),
                sender: $request->user(),
                kind: 'content_removed',
                context: ['post_title' => $title],
            ));
        }

        return response()->json([
            'status' => 'success',
            'message' => "Post #{$post->id} deleted.",
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
            'notify_author' => ['sometimes', 'boolean'],
            'notify_reporter' => ['sometimes', 'boolean'],
        ]);

        $action = $validated['action'];
        $moderator = $request->user();
        $notes = $validated['moderator_notes'] ?? null;
        $reporter = $report->reporter;

        if ($action === 'dismiss') {
            $report->update([
                'status' => 'dismissed',
                'notes' => $notes ?? $report->notes,
            ]);

            if ($reporter && ($validated['notify_reporter'] ?? true)) {
                $reporter->notify(new ModerationNotice(
                    title: 'Update on your report',
                    body: 'Thanks for your report. Our moderators reviewed it and found the content does not break the community guidelines.',
                    sender: $moderator,
                    kind: 'report_outcome',
                    context: ['report_id' => $report->id, 'outcome' => 'dismissed'],
                ));
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Report dismissed as non-violating.',
                'data' => new ReportResource($report->fresh(['reporter', 'reportable.user'])),
            ]);
        }

        // Action: 'delete_content'
        $item = $report->reportable;
        $author = $item?->user;
        $label = $item instanceof Post ? 'post "'.Str::limit($item->title, 80).'"' : 'comment';

        if ($item instanceof Post) {
            $this->deletePostWithMedia($item);
        } elseif ($item instanceof Comment) {
            $item->delete();
        }

        // Every other pending report against the same item is now settled too.
        Report::where('reportable_type', $report->reportable_type)
            ->where('reportable_id', $report->reportable_id)
            ->where('status', 'pending')
            ->update(['status' => 'reviewed']);

        $report->update([
            'status' => 'reviewed',
            'notes' => $notes ?? $report->notes,
        ]);

        if ($author && ($validated['notify_author'] ?? true)) {
            $author->notify(new ModerationNotice(
                title: 'Your content was removed',
                body: $this->removalMessage($label, $notes, $report->reason),
                sender: $moderator,
                kind: 'content_removed',
                context: ['report_id' => $report->id],
            ));
        }

        if ($reporter && ($validated['notify_reporter'] ?? true)) {
            $reporter->notify(new ModerationNotice(
                title: 'Update on your report',
                body: 'Thanks for your report. The content you flagged has been removed.',
                sender: $moderator,
                kind: 'report_outcome',
                context: ['report_id' => $report->id, 'outcome' => 'removed'],
            ));
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Offending content removed and report marked as reviewed.',
            'data' => new ReportResource($report->fresh(['reporter'])),
        ]);
    }

    /**
     * Delete a post together with any uploaded media files on the public disk.
     */
    protected function deletePostWithMedia(Post $post): void
    {
        foreach ($post->media as $mediaItem) {
            if (! str_starts_with($mediaItem->file_path, 'http://') && ! str_starts_with($mediaItem->file_path, 'https://')) {
                Storage::disk('public')->delete($mediaItem->file_path);
            }
        }

        $post->delete();
    }

    /**
     * Compose the message sent to an author whose content was removed.
     *
     * @param  string  $subject  e.g. `post "Title"` or `comment`
     */
    protected function removalMessage(string $subject, ?string $notes, ?string $reportReason = null): string
    {
        $message = "A moderator removed your {$subject}.";

        if ($reportReason) {
            $message .= " Reason reported: {$reportReason}.";
        }

        if ($notes) {
            $message .= " Moderator note: {$notes}";
        }

        return $message;
    }
}
