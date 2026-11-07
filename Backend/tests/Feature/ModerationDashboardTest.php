<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Post;
use App\Models\Report;
use App\Models\User;
use App\Notifications\ModerationNotice;
use App\Notifications\ReportSubmitted;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ModerationDashboardTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected User $moderator;

    protected User $member;

    protected Category $category;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create(['role' => 'admin']);
        $this->moderator = User::factory()->create(['role' => 'moderator']);
        $this->member = User::factory()->create(['role' => 'user', 'password' => Hash::make('secret-pass')]);
        $this->category = Category::create(['name' => 'Cosmology', 'slug' => 'cosmology']);
    }

    protected function makePost(User $author, string $status = 'published'): Post
    {
        return Post::create([
            'user_id' => $author->id,
            'category_id' => $this->category->id,
            'title' => 'On contingency',
            'content' => 'Body text',
            'status' => $status,
        ]);
    }

    public function test_overview_returns_charts_rankings_and_active_users(): void
    {
        $this->makePost($this->member);
        $this->makePost($this->member, 'pending');
        $this->member->followers()->attach([$this->admin->id, $this->moderator->id]);

        $this->member->createToken('spa');
        $this->member->tokens()->update(['last_used_at' => now()->subMinutes(2)]);
        $this->admin->createToken('spa');
        $this->admin->tokens()->update(['last_used_at' => now()->subHours(3)]);

        Sanctum::actingAs($this->member);
        $this->getJson('/api/moderation/overview')->assertForbidden();

        Sanctum::actingAs($this->moderator);
        $response = $this->getJson('/api/moderation/overview?days=7')->assertOk();

        $response->assertJsonPath('data.stats.active_users_count', 1)
            ->assertJsonPath('data.stats.total_follows_count', 2)
            ->assertJsonPath('data.posts_by_category.0.posts_count', 1)
            ->assertJsonPath('data.posts_by_category.0.pending_posts_count', 1)
            ->assertJsonPath('data.top_followed.0.id', $this->member->id)
            ->assertJsonPath('data.top_followed.0.followers_count', 2)
            ->assertJsonPath('data.top_posters.0.id', $this->member->id)
            ->assertJsonPath('data.active_users.0.id', $this->member->id)
            ->assertJsonCount(7, 'data.activity')
            ->assertJsonCount(1, 'data.active_users');

        $this->assertSame(2, collect($response->json('data.activity'))->sum('posts'));
    }

    public function test_submitting_a_report_notifies_staff(): void
    {
        Notification::fake();
        $post = $this->makePost($this->admin);

        Sanctum::actingAs($this->member);
        $this->postJson('/api/reports', [
            'reportable_type' => 'post',
            'reportable_id' => $post->id,
            'reason' => 'Misinformation',
        ])->assertCreated();

        Notification::assertSentTo([$this->admin, $this->moderator], ReportSubmitted::class);
        Notification::assertNotSentTo($this->member, ReportSubmitted::class);
    }

    public function test_staff_inbox_lists_report_notifications_and_marks_them_read(): void
    {
        $post = $this->makePost($this->admin);
        Sanctum::actingAs($this->member);
        $this->postJson('/api/reports', ['reportable_type' => 'post', 'reportable_id' => $post->id, 'reason' => 'Spam']);

        Sanctum::actingAs($this->moderator);
        $this->getJson('/api/moderation/notifications')
            ->assertOk()
            ->assertJsonPath('unread_count', 1)
            ->assertJsonPath('data.data.0.kind', 'report')
            ->assertJsonPath('data.data.0.data.reportable_id', $post->id);

        $this->postJson('/api/moderation/notifications/read')->assertJsonPath('unread_count', 0);
    }

    public function test_deleting_reported_content_notifies_author_and_reporter_and_settles_duplicates(): void
    {
        $post = $this->makePost($this->member);
        $reporters = User::factory()->count(2)->create();
        $reports = $reporters->map(fn (User $reporter) => Report::create([
            'reporter_id' => $reporter->id,
            'reportable_type' => Post::class,
            'reportable_id' => $post->id,
            'reason' => 'Harassment',
            'status' => 'pending',
        ]));

        Sanctum::actingAs($this->moderator);
        $this->postJson("/api/moderation/reports/{$reports[0]->id}/resolve", [
            'action' => 'delete_content',
            'moderator_notes' => 'Personal attacks are not allowed.',
        ])->assertOk();

        $this->assertModelMissing($post);
        $this->assertSame('reviewed', $reports[1]->fresh()->status);

        $authorNotice = $this->member->notifications()->first();
        $this->assertSame('content_removed', $authorNotice->data['kind']);
        $this->assertStringContainsString('Personal attacks are not allowed.', $authorNotice->data['body']);
        $this->assertSame('report_outcome', $reporters[0]->notifications()->first()->data['kind']);
    }

    public function test_moderator_can_delete_any_post_directly(): void
    {
        Notification::fake();
        $post = $this->makePost($this->member);

        Sanctum::actingAs($this->member);
        $this->deleteJson("/api/moderation/posts/{$post->id}")->assertForbidden();

        Sanctum::actingAs($this->moderator);
        $this->deleteJson("/api/moderation/posts/{$post->id}", ['reason' => 'Off-topic'])->assertOk();

        $this->assertModelMissing($post);
        Notification::assertSentTo($this->member, ModerationNotice::class, fn (ModerationNotice $notice) => $notice->kind === 'content_removed');
    }

    public function test_user_directory_filters_and_sorts(): void
    {
        $popular = User::factory()->create(['name' => 'Popular Scholar']);
        $popular->followers()->attach([$this->member->id, $this->admin->id]);
        User::factory()->create(['blocked_at' => now()]);

        Sanctum::actingAs($this->moderator);

        $this->getJson('/api/moderation/users?sort=followers')
            ->assertOk()
            ->assertJsonPath('data.data.0.id', $popular->id)
            ->assertJsonPath('data.data.0.followers_count', 2);

        $this->getJson('/api/moderation/users?search=Popular')->assertJsonCount(1, 'data.data');
        $this->getJson('/api/moderation/users?filter=blocked')
            ->assertJsonCount(1, 'data.data')
            ->assertJsonPath('data.data.0.is_blocked', true);
        $this->getJson('/api/moderation/users?filter=staff')->assertJsonCount(2, 'data.data');
    }

    public function test_blocking_revokes_tokens_and_prevents_login_until_unblocked(): void
    {
        $this->member->createToken('spa');

        Sanctum::actingAs($this->moderator);
        $this->postJson("/api/moderation/users/{$this->member->id}/block", ['reason' => 'Spam'])
            ->assertOk()
            ->assertJsonPath('data.is_blocked', true)
            ->assertJsonPath('data.block_reason', 'Spam');

        $this->assertSame(0, $this->member->tokens()->count());
        $this->postJson('/api/auth/login', ['login' => $this->member->email, 'password' => 'secret-pass'])->assertForbidden();

        Sanctum::actingAs($this->moderator);
        $this->postJson("/api/moderation/users/{$this->member->id}/unblock")->assertOk()->assertJsonPath('data.is_blocked', false);
        $this->postJson('/api/auth/login', ['login' => $this->member->email, 'password' => 'secret-pass'])->assertOk();
    }

    public function test_block_permissions_protect_staff_and_self(): void
    {
        Sanctum::actingAs($this->moderator);
        $this->postJson("/api/moderation/users/{$this->moderator->id}/block")->assertForbidden();
        $this->postJson("/api/moderation/users/{$this->admin->id}/block")->assertForbidden();

        $otherModerator = User::factory()->create(['role' => 'moderator']);
        $this->postJson("/api/moderation/users/{$otherModerator->id}/block")->assertForbidden();

        Sanctum::actingAs($this->admin);
        $this->postJson("/api/moderation/users/{$otherModerator->id}/block")->assertOk();
    }

    public function test_staff_can_send_notifications_to_selected_users_or_everyone(): void
    {
        Sanctum::actingAs($this->member);
        $this->postJson('/api/moderation/notifications/send', ['audience' => 'all', 'title' => 'x', 'body' => 'y'])->assertForbidden();

        Sanctum::actingAs($this->moderator);
        $this->postJson('/api/moderation/notifications/send', [
            'audience' => 'users',
            'user_ids' => [$this->member->id],
            'title' => 'Friendly reminder',
            'body' => 'Please cite your sources.',
        ])->assertCreated()->assertJsonPath('recipients_count', 1);

        Sanctum::actingAs($this->member);
        $this->getJson('/api/notifications')
            ->assertOk()
            ->assertJsonPath('unread_count', 1)
            ->assertJsonPath('data.data.0.title', 'Friendly reminder')
            ->assertJsonPath('data.data.0.data.sender.id', $this->moderator->id);

        Sanctum::actingAs($this->moderator);
        $this->postJson('/api/moderation/notifications/send', ['audience' => 'all', 'title' => 'Maintenance', 'body' => 'Tonight.'])
            ->assertJsonPath('recipients_count', 2);
    }

    public function test_members_can_follow_and_unfollow(): void
    {
        $scholar = User::factory()->create();
        Sanctum::actingAs($this->member);

        $this->postJson("/api/users/{$scholar->id}/follow")->assertJsonPath('following', true)->assertJsonPath('followers_count', 1);
        $this->postJson("/api/users/{$scholar->id}/follow")->assertJsonPath('following', false)->assertJsonPath('followers_count', 0);
        $this->postJson("/api/users/{$this->member->id}/follow")->assertUnprocessable();
    }
}
