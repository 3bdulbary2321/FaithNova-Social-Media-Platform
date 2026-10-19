<?php

namespace App\Http\Controllers;

use App\Http\Requests\Report\StoreReportRequest;
use App\Models\Comment;
use App\Models\Post;
use App\Models\Report;
use Illuminate\Http\JsonResponse;

class ReportController extends Controller
{
    /**
     * Map frontend friendly model identifiers to fully qualified class names.
     */
    protected array $typeMap = [
        'post' => Post::class,
        'comment' => Comment::class,
        Post::class => Post::class,
        Comment::class => Comment::class,
    ];

    /**
     * Store a new polymorphic content report.
     */
    public function store(StoreReportRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $user = $request->user();

        $targetClass = $this->typeMap[$validated['reportable_type']] ?? Post::class;
        $reportableId = (int) $validated['reportable_id'];

        // Verify the target post or comment actually exists
        $targetExists = $targetClass::where('id', $reportableId)->exists();
        if (! $targetExists) {
            $modelName = class_basename($targetClass);
            return response()->json([
                'status' => 'error',
                'message' => "The target {$modelName} #{$reportableId} does not exist.",
            ], 404);
        }

        // Prevent duplicate pending reports from the same user for the same item
        $existingReport = Report::where('reporter_id', $user->id)
            ->where('reportable_type', $targetClass)
            ->where('reportable_id', $reportableId)
            ->where('status', 'pending')
            ->first();

        if ($existingReport) {
            return response()->json([
                'status' => 'error',
                'message' => 'You have already submitted a report for this content that is currently pending review.',
            ], 409);
        }

        $report = Report::create([
            'reporter_id' => $user->id,
            'reportable_type' => $targetClass,
            'reportable_id' => $reportableId,
            'reason' => $validated['reason'],
            'notes' => $validated['notes'] ?? null,
            'status' => 'pending',
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Content report submitted successfully. Our academic moderators will review it promptly.',
            'data' => [
                'id' => $report->id,
                'reportable_type' => class_basename($targetClass),
                'reportable_id' => $report->reportable_id,
                'reason' => $report->reason,
                'notes' => $report->notes,
                'status' => $report->status,
                'created_at' => $report->created_at?->toISOString(),
            ],
        ], 201);
    }
}
