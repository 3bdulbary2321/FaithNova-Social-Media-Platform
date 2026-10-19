<?php

namespace App\Http\Controllers;

use App\Http\Requests\Category\StoreCategoryRequest;
use App\Http\Requests\Category\UpdateCategoryRequest;
use App\Http\Resources\CategoryResource;
use App\Http\Resources\PostResource;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    /**
     * Display a listing of all categories with published post counts.
     */
    public function index(): JsonResponse
    {
        $categories = Category::withCount(['posts' => function ($query) {
            $query->where('status', 'published');
        }])->get();

        return response()->json([
            'status' => 'success',
            'data' => CategoryResource::collection($categories),
        ]);
    }

    /**
     * Display a paginated list of published posts under a specific category.
     */
    public function posts(string $slug, Request $request): JsonResponse
    {
        $category = Category::where('slug', $slug)
            ->orWhere('id', $slug)
            ->withCount(['posts' => function ($query) {
                $query->where('status', 'published');
            }])
            ->first();

        if (! $category) {
            return response()->json([
                'status' => 'error',
                'message' => "Category '{$slug}' not found.",
            ], 404);
        }

        $perPage = (int) $request->input('per_page', 10);
        $posts = $category->posts()
            ->where('status', 'published')
            ->with(['user', 'media', 'category'])
            ->withCount(['comments', 'reactions', 'likes', 'insightfuls'])
            ->latest()
            ->paginate($perPage);

        return response()->json([
            'status' => 'success',
            'category' => new CategoryResource($category),
            'posts' => PostResource::collection($posts)->response()->getData(true),
        ]);
    }

    /**
     * Store a newly created category in storage (Admin only).
     */
    public function store(StoreCategoryRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $slug = ! empty($validated['slug'])
            ? Str::slug($validated['slug'])
            : Str::slug($validated['name']);

        $category = Category::create([
            'name' => $validated['name'],
            'slug' => $slug,
            'description' => $validated['description'] ?? null,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Category created successfully.',
            'data' => new CategoryResource($category),
        ], 201);
    }

    /**
     * Update the specified category in storage (Admin only).
     */
    public function update(UpdateCategoryRequest $request, Category $category): JsonResponse
    {
        $validated = $request->validated();

        if (! empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['slug']);
        }

        $category->update($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Category updated successfully.',
            'data' => new CategoryResource($category),
        ]);
    }

    /**
     * Remove the specified category from storage (Admin only).
     */
    public function destroy(Category $category): JsonResponse
    {
        $category->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Category deleted successfully.',
        ]);
    }
}
