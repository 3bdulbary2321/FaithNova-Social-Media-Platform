<?php

namespace App\Http\Controllers;

use App\Http\Requests\Post\StorePostRequest;
use App\Http\Requests\Post\UpdatePostRequest;
use App\Http\Resources\PostResource;
use App\Models\Post;
use App\Models\PostMedia;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;

class PostController extends Controller
{
    /**
     * Display a paginated feed of published posts.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Post::where('status', 'published')
            ->with(['user', 'category', 'media'])
            ->withCount(['comments', 'reactions', 'likes', 'insightfuls']);

        // Filter by category ID or slug
        if ($request->filled('category_id')) {
            $query->where('category_id', $request->input('category_id'));
        } elseif ($request->filled('category')) {
            $categoryIdentifier = $request->input('category');
            $query->whereHas('category', function ($q) use ($categoryIdentifier) {
                $q->where('slug', $categoryIdentifier)
                  ->orWhere('id', $categoryIdentifier);
            });
        }

        // Sorting: 'popular', 'insightful', or default 'latest'
        $sort = $request->input('sort', 'latest');
        if ($sort === 'popular') {
            $query->orderByDesc('reactions_count')->latest('id');
        } elseif ($sort === 'insightful') {
            $query->orderByDesc('insightfuls_count')->latest('id');
        } else {
            $query->latest('id');
        }

        $perPage = (int) $request->input('per_page', 10);
        $posts = $query->paginate($perPage);

        return response()->json([
            'status' => 'success',
            'data' => PostResource::collection($posts)->response()->getData(true),
        ]);
    }

    /**
     * Search published posts using MySQL Full-Text search.
     */
    public function search(Request $request): JsonResponse
    {
        $searchTerm = trim((string) ($request->input('q') ?? $request->input('query', '')));

        if (empty($searchTerm)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Please provide a non-empty search query parameter (e.g., ?q=quantum).',
            ], 422);
        }

        $query = Post::where('status', 'published')
            ->with(['user', 'category', 'media'])
            ->withCount(['comments', 'reactions', 'likes', 'insightfuls']);

        // Check database driver: MySQL/MariaDB natively supports fulltext search
        if (Schema::getConnection()->getDriverName() === 'sqlite') {
            $query->where(function ($q) use ($searchTerm) {
                $likeTerm = '%' . $searchTerm . '%';
                $q->where('title', 'like', $likeTerm)
                  ->orWhere('content', 'like', $likeTerm)
                  ->orWhere('religious_reference', 'like', $likeTerm)
                  ->orWhere('scientific_reference', 'like', $likeTerm);
            });
        } else {
            $query->whereFullText(
                ['title', 'content', 'religious_reference', 'scientific_reference'],
                $searchTerm
            );
        }

        $perPage = (int) $request->input('per_page', 10);
        $posts = $query->latest('id')->paginate($perPage);

        return response()->json([
            'status' => 'success',
            'query' => $searchTerm,
            'data' => PostResource::collection($posts)->response()->getData(true),
        ]);
    }

    /**
     * Display the specified post with author, media, counts, and nested discussion.
     */
    public function show(string|int $id, Request $request): JsonResponse
    {
        $post = Post::with([
            'user',
            'category',
            'media',
            'rootComments' => function ($query) {
                $query->with(['user', 'replies.user'])->latest('id');
            },
        ])
        ->withCount(['comments', 'reactions', 'likes', 'insightfuls'])
        ->find($id);

        if (! $post) {
            return response()->json([
                'status' => 'error',
                'message' => "Post #{$id} not found.",
            ], 404);
        }

        // Only allow author or moderator/admin to preview unpublished posts
        if ($post->status !== 'published') {
            $currentUser = $request->user('sanctum') ?? $request->user();
            if (! $currentUser || ($currentUser->id !== $post->user_id && ! $currentUser->isModerator())) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Post is currently under academic review or not publicly available.',
                ], 403);
            }
        }

        return response()->json([
            'status' => 'success',
            'data' => new PostResource($post),
        ]);
    }

    /**
     * Store a newly created post with optional multimedia attachments.
     */
    public function store(StorePostRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $user = $request->user();

        // Create post and store media attachments inside a DB Transaction
        $post = DB::transaction(function () use ($request, $validated, $user) {
            $post = Post::create([
                'user_id' => $user->id,
                'category_id' => $validated['category_id'],
                'title' => $validated['title'],
                'content' => $validated['content'],
                'religious_reference' => $validated['religious_reference'] ?? null,
                'scientific_reference' => $validated['scientific_reference'] ?? null,
                'status' => $validated['status'] ?? 'published',
            ]);

            if ($request->hasFile('media')) {
                foreach ($request->file('media') as $file) {
                    $mime = (string) $file->getMimeType();
                    if (str_starts_with($mime, 'image/')) {
                        $mediaType = 'image';
                    } elseif (str_starts_with($mime, 'video/')) {
                        $mediaType = 'video';
                    } else {
                        $mediaType = 'document';
                    }

                    $filename = 'post_' . $post->id . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
                    $path = $file->storeAs('posts', $filename, 'public');

                    PostMedia::create([
                        'post_id' => $post->id,
                        'file_path' => $path,
                        'media_type' => $mediaType,
                    ]);
                }
            }

            return $post;
        });

        $post->load(['user', 'category', 'media'])
            ->loadCount(['comments', 'reactions', 'likes', 'insightfuls']);

        return response()->json([
            'status' => 'success',
            'message' => 'Post published successfully.',
            'data' => new PostResource($post),
        ], 201);
    }

    /**
     * Update the specified post.
     */
    public function update(UpdatePostRequest $request, Post $post): JsonResponse
    {
        $user = $request->user();

        // Authorization check: only post owner or staff can edit
        if ($user->id !== $post->user_id && ! $user->isModerator()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Forbidden. You do not have permission to modify this post.',
            ], 403);
        }

        $validated = $request->validated();

        DB::transaction(function () use ($request, $validated, $post) {
            $post->update(collect($validated)->except(['media'])->toArray());

            // Handle additional media uploads if provided
            if ($request->hasFile('media')) {
                foreach ($request->file('media') as $file) {
                    $mime = (string) $file->getMimeType();
                    if (str_starts_with($mime, 'image/')) {
                        $mediaType = 'image';
                    } elseif (str_starts_with($mime, 'video/')) {
                        $mediaType = 'video';
                    } else {
                        $mediaType = 'document';
                    }

                    $filename = 'post_' . $post->id . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
                    $path = $file->storeAs('posts', $filename, 'public');

                    PostMedia::create([
                        'post_id' => $post->id,
                        'file_path' => $path,
                        'media_type' => $mediaType,
                    ]);
                }
            }
        });

        $post->load(['user', 'category', 'media'])
            ->loadCount(['comments', 'reactions', 'likes', 'insightfuls']);

        return response()->json([
            'status' => 'success',
            'message' => 'Post updated successfully.',
            'data' => new PostResource($post),
        ]);
    }

    /**
     * Remove the specified post and its physical media files from storage.
     */
    public function destroy(Request $request, Post $post): JsonResponse
    {
        $user = $request->user();

        // Authorization check: only post owner or staff can delete
        if ($user->id !== $post->user_id && ! $user->isModerator()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Forbidden. You do not have permission to delete this post.',
            ], 403);
        }

        // Clean up physically stored media files
        foreach ($post->media as $mediaItem) {
            if (! str_starts_with($mediaItem->file_path, 'http://') && ! str_starts_with($mediaItem->file_path, 'https://')) {
                Storage::disk('public')->delete($mediaItem->file_path);
            }
        }

        $post->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Post and associated media deleted successfully.',
        ]);
    }
}
