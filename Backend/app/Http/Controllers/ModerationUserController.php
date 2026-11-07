<?php

namespace App\Http\Controllers;

use App\Http\Resources\UserResource;
use App\Models\User;
use App\Notifications\ModerationNotice;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ModerationUserController extends Controller
{
    /**
     * Searchable, filterable member directory for moderators.
     */
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
            'filter' => ['nullable', 'string', 'in:all,active,blocked,staff'],
            'sort' => ['nullable', 'string', 'in:newest,followers,posts,active'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $query = User::query()
            ->withCount(['followers', 'following', 'posts', 'comments'])
            ->withLastActiveAt();

        if ($search = $validated['search'] ?? null) {
            $query->where(function ($inner) use ($search) {
                $inner->where('name', 'like', "%{$search}%")
                    ->orWhere('username', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        match ($validated['filter'] ?? 'all') {
            'active' => $query->activeWithin(15),
            'blocked' => $query->whereNotNull('blocked_at'),
            'staff' => $query->whereIn('role', ['admin', 'moderator']),
            default => null,
        };

        match ($validated['sort'] ?? 'newest') {
            'followers' => $query->orderByDesc('followers_count'),
            'posts' => $query->orderByDesc('posts_count'),
            'active' => $query->orderByDesc('last_active_at'),
            default => $query->latest('id'),
        };

        $users = $query->paginate($validated['per_page'] ?? 15);

        return response()->json([
            'status' => 'success',
            'data' => UserResource::collection($users)->response()->getData(true),
        ]);
    }

    /**
     * Block a member: revoke every session and stop future sign-ins.
     */
    public function block(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'reason' => ['nullable', 'string', 'max:500'],
        ]);

        $moderator = $request->user();

        if ($user->is($moderator)) {
            return $this->forbidden('You cannot block your own account.');
        }

        if (in_array($user->role, ['admin', 'moderator'], true) && ! $moderator->isAdmin()) {
            return $this->forbidden('Only an administrator can block staff accounts.');
        }

        if ($user->isAdmin()) {
            return $this->forbidden('Administrator accounts cannot be blocked.');
        }

        $user->forceFill([
            'blocked_at' => now(),
            'block_reason' => $validated['reason'] ?? null,
        ])->save();

        $user->tokens()->delete();

        $user->notify(new ModerationNotice(
            title: 'Your account has been blocked',
            body: 'A moderator blocked your account.'.(isset($validated['reason']) ? " Reason: {$validated['reason']}" : ''),
            sender: $moderator,
            kind: 'account_blocked',
        ));

        return response()->json([
            'status' => 'success',
            'message' => "{$user->name} has been blocked.",
            'data' => new UserResource($user->loadCount(['followers', 'following', 'posts', 'comments'])),
        ]);
    }

    /**
     * Restore access for a blocked member.
     */
    public function unblock(Request $request, User $user): JsonResponse
    {
        $user->forceFill(['blocked_at' => null, 'block_reason' => null])->save();

        $user->notify(new ModerationNotice(
            title: 'Your account has been restored',
            body: 'A moderator restored your account. Welcome back.',
            sender: $request->user(),
            kind: 'account_unblocked',
        ));

        return response()->json([
            'status' => 'success',
            'message' => "{$user->name} has been unblocked.",
            'data' => new UserResource($user->loadCount(['followers', 'following', 'posts', 'comments'])),
        ]);
    }

    protected function forbidden(string $message): JsonResponse
    {
        return response()->json(['status' => 'error', 'message' => $message], 403);
    }
}
