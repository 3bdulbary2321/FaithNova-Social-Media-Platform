<?php

namespace App\Http\Controllers;

use App\Http\Resources\NotificationResource;
use App\Models\User;
use App\Notifications\ModerationNotice;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Notification;

class NotificationController extends Controller
{
    /**
     * List the signed-in user's notifications (members and staff alike).
     */
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'unread' => ['sometimes', 'boolean'],
            'kind' => ['nullable', 'string', 'max:50'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $user = $request->user();
        $query = $request->boolean('unread') ? $user->unreadNotifications() : $user->notifications();

        if ($kind = $validated['kind'] ?? null) {
            $query->where('data->kind', $kind);
        }

        $notifications = $query->paginate($validated['per_page'] ?? 20);

        return response()->json([
            'status' => 'success',
            'unread_count' => $user->unreadNotifications()->count(),
            'data' => NotificationResource::collection($notifications)->response()->getData(true),
        ]);
    }

    /**
     * Mark specific notifications (or all of them when no ids are given) as read.
     */
    public function markRead(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'ids' => ['sometimes', 'array'],
            'ids.*' => ['string'],
        ]);

        $query = $request->user()->unreadNotifications();

        if (! empty($validated['ids'])) {
            $query->whereIn('id', $validated['ids']);
        }

        $query->update(['read_at' => now()]);

        return response()->json([
            'status' => 'success',
            'unread_count' => $request->user()->unreadNotifications()->count(),
        ]);
    }

    /**
     * Staff only: send a message to one member, a list of members, or every member.
     */
    public function send(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'audience' => ['required', 'string', 'in:users,all'],
            'user_ids' => ['required_if:audience,users', 'array', 'min:1', 'max:100'],
            'user_ids.*' => ['integer', 'exists:users,id'],
            'title' => ['required', 'string', 'max:120'],
            'body' => ['required', 'string', 'max:2000'],
        ]);

        $recipients = $validated['audience'] === 'all'
            ? User::whereNull('blocked_at')->where('id', '!=', $request->user()->id)->get()
            : User::whereIn('id', $validated['user_ids'])->get();

        Notification::send($recipients, new ModerationNotice(
            title: $validated['title'],
            body: $validated['body'],
            sender: $request->user(),
            kind: $validated['audience'] === 'all' ? 'announcement' : 'message',
        ));

        return response()->json([
            'status' => 'success',
            'message' => "Notification sent to {$recipients->count()} ".str('member')->plural($recipients->count()).'.',
            'recipients_count' => $recipients->count(),
        ], 201);
    }
}
