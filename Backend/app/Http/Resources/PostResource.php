<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class PostResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        // Detect current authenticated user (supports both token and session)
        $currentUser = $request->user('sanctum') ?? $request->user();
        $userReaction = null;

        if ($currentUser) {
            if ($this->relationLoaded('reactions')) {
                $userReaction = $this->reactions->firstWhere('user_id', $currentUser->id)?->type;
            } else {
                $userReaction = $this->reactions()->where('user_id', $currentUser->id)->value('type');
            }
        }

        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'category_id' => $this->category_id,
            'title' => $this->title,
            'content' => $this->content,
            'religious_reference' => $this->religious_reference,
            'scientific_reference' => $this->scientific_reference,
            'status' => $this->status,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
            'author' => new UserResource($this->whenLoaded('user')),
            'category' => new CategoryResource($this->whenLoaded('category')),
            'media' => $this->whenLoaded('media', function () {
                return $this->media->map(function ($item) {
                    $url = $item->file_path;
                    if (! str_starts_with($url, 'http://') && ! str_starts_with($url, 'https://')) {
                        $url = asset(Storage::url($item->file_path));
                    }

                    return [
                        'id' => $item->id,
                        'file_path' => $url,
                        'media_type' => $item->media_type,
                    ];
                });
            }),
            'stats' => [
                'comments_count' => (int) ($this->comments_count ?? 0),
                'reactions_count' => (int) ($this->reactions_count ?? 0),
                'likes_count' => (int) ($this->likes_count ?? 0),
                'insightfuls_count' => (int) ($this->insightfuls_count ?? 0),
            ],
            'user_reaction' => $userReaction,
            'comments' => CommentResource::collection(
                $this->whenLoaded('rootComments', function () {
                    return $this->rootComments;
                }, function () {
                    return $this->whenLoaded('comments');
                })
            ),
        ];
    }
}
