<?php

namespace App\Http\Resources;

use App\Models\Comment;
use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReportResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $reportableData = null;

        if ($this->relationLoaded('reportable') && $this->reportable) {
            if ($this->reportable instanceof Post) {
                $reportableData = [
                    'type' => 'post',
                    'id' => $this->reportable->id,
                    'title' => $this->reportable->title,
                    'content' => $this->reportable->content,
                    'status' => $this->reportable->status,
                    'author' => [
                        'id' => $this->reportable->user?->id,
                        'name' => $this->reportable->user?->name,
                        'username' => $this->reportable->user?->username,
                        'avatar' => $this->reportable->user?->avatar,
                    ],
                ];
            } elseif ($this->reportable instanceof Comment) {
                $reportableData = [
                    'type' => 'comment',
                    'id' => $this->reportable->id,
                    'post_id' => $this->reportable->post_id,
                    'content' => $this->reportable->content,
                    'author' => [
                        'id' => $this->reportable->user?->id,
                        'name' => $this->reportable->user?->name,
                        'username' => $this->reportable->user?->username,
                        'avatar' => $this->reportable->user?->avatar,
                    ],
                ];
            }
        }

        return [
            'id' => $this->id,
            'reporter' => new UserResource($this->whenLoaded('reporter')),
            'reportable_type' => class_basename($this->reportable_type),
            'reportable_id' => $this->reportable_id,
            'reason' => $this->reason,
            'notes' => $this->notes,
            'status' => $this->status,
            'created_at' => $this->created_at?->toISOString(),
            'created_at_human' => $this->created_at?->diffForHumans(),
            'updated_at' => $this->updated_at?->toISOString(),
            'reportable' => $reportableData,
        ];
    }
}
