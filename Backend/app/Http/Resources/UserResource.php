<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Carbon;
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
            'followers_count' => $this->whenCounted('followers', $this->followers_count),
            'following_count' => $this->whenCounted('following', $this->following_count),
            'is_blocked' => $this->blocked_at !== null,
            $this->mergeWhen($this->canSeeModerationFields($request), fn () => [
                'blocked_at' => $this->blocked_at?->toISOString(),
                'block_reason' => $this->block_reason,
                'last_active_at' => $this->last_active_at ? Carbon::parse($this->last_active_at)->toISOString() : null,
            ]),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }

    /**
     * Only moderation staff should see block reasons and activity timestamps.
     */
    protected function canSeeModerationFields(Request $request): bool
    {
        return in_array($request->user()?->role, ['admin', 'moderator'], true);
    }
}
