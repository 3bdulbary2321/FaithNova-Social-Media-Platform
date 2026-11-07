<?php

namespace App\Notifications;

use App\Models\Report;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

/**
 * Alerts moderation staff that a user has flagged a post or comment.
 */
class ReportSubmitted extends Notification
{
    use Queueable;

    public function __construct(public Report $report) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * @return array{kind: string, title: string, body: string, report_id: int, reportable_type: string, reportable_id: int, reporter: array{id: int|null, name: string|null, username: string|null}}
     */
    public function toArray(object $notifiable): array
    {
        $reporter = $this->report->reporter;
        $target = strtolower(class_basename($this->report->reportable_type));

        return [
            'kind' => 'report',
            'title' => "New {$target} report",
            'body' => "{$reporter?->name} reported a {$target}: {$this->report->reason}",
            'report_id' => $this->report->id,
            'reportable_type' => $target,
            'reportable_id' => $this->report->reportable_id,
            'reporter' => [
                'id' => $reporter?->id,
                'name' => $reporter?->name,
                'username' => $reporter?->username,
            ],
        ];
    }
}
