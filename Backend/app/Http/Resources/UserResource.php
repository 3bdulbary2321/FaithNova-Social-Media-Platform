<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $avatarUrl = null;
        if ($this->avatar) {
            if (str_starts_with($this->avatar, 'http://') || str_starts_with($this->avatar, 'https://')) {
                $avatarUrl = $this->avatar;
            } else {
                $avatarUrl = asset(Storage::url($this->avatar));
            }
        }

        return [
            'id' => $this->id,
            'name' => $this->name,
            'username' => $this->username,
            'email' => $this->email,
            'avatar' => $avatarUrl,
            'bio' => $this->bio,
            'role' => $this->role,
            'is_admin' => $this->role === 'admin',
            'is_moderator' => in_array($this->role, ['admin', 'moderator'], true),
            'posts_count' => $this->whenCounted('posts', $this->posts_count),
            'comments_count' => $this->whenCounted('comments', $this->comments_count),
            'reactions_count' => $this->whenCounted('reactions', $this->reactions_count),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
