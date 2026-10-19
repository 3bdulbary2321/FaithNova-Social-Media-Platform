<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Comment;
use App\Models\Post;
use App\Models\PostMedia;
use App\Models\Report;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class Phase5ModerationTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $moderator;
    protected User $regularUser;
    protected Category $category;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create([
            'name' => 'FaithNova Admin',
            'username' => 'admin',
            'role' => 'admin',
        ]);

        $this->moderator = User::factory()->create([
            'name' => 'Dr. Tariq Al-Mansoor',
            'username' => 'talmansoor',
            'role' => 'moderator',
        ]);

        $this->regularUser = User::factory()->create([
            'name' => 'Standard User',
            'username' => 'std_user',
            'role' => 'user',
        ]);

        $this->category = Category::create([
            'name' => 'Physics & Philosophy',
            'slug' => 'physics-philosophy',
            'description' => 'Discourse on physical ontology and metaphysics.',
        ]);
    }

    /**
     * Test moderation dashboard stats endpoint and RBAC guard.
     */
    public function test_moderation_stats_accessible_only_to_staff(): void
    {
        // Regular user should get 403 Forbidden
        Sanctum::actingAs($this->regularUser);
        $respUser = $this->getJson('/api/moderation/stats');
        $respUser->assertStatus(403);

        // Moderator should get 200 OK with correct schema
        Sanctum::actingAs($this->moderator);
        $respMod = $this->getJson('/api/moderation/stats');
        $respMod->assertStatus(200)
            ->assertJsonStructure([
                'status',
                'data' => [
                    'pending_posts_count',
                    'pending_reports_count',
                    'total_users_count',
                    'total_published_posts_count',
                ],
            ]);
    }

    /**
     * Test pending posts queue returns only pending posts.
     */
    public function test_pending_posts_queue(): void
    {
        Post::create([
            'user_id' => $this->regularUser->id,
            'category_id' => $this->category->id,
            'title' => 'Published Article',
            'content' => 'Already published content.',
            'status' => 'published',
        ]);

        $pendingPost = Post::create([
            'user_id' => $this->regularUser->id,
            'category_id' => $this->category->id,
            'title' => 'Submitted Draft for Review',
            'content' => 'Seeking academic peer review.',
            'status' => 'pending',
        ]);

        Sanctum::actingAs($this->moderator);
        $response = $this->getJson('/api/moderation/posts/pending');

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonCount(1, 'data.data')
            ->assertJsonPath('data.data.0.id', $pendingPost->id)
            ->assertJsonPath('data.data.0.title', 'Submitted Draft for Review');
    }

    /**
     * Test approving and rejecting pending posts.
     */
    public function test_update_post_moderation_status(): void
    {
        $post = Post::create([
            'user_id' => $this->regularUser->id,
            'category_id' => $this->category->id,
            'title' => 'Cosmological Boundary State',
            'content' => 'Mathematical formulation of the initial state.',
            'status' => 'pending',
        ]);

        Sanctum::actingAs($this->moderator);

        // Approve post
        $approved = $this->patchJson("/api/moderation/posts/{$post->id}/status", [
            'status' => 'published',
        ]);

        $approved->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('data.status', 'published');

        $this->assertEquals('published', $post->fresh()->status);

        // Reject post
        $rejected = $this->patchJson("/api/moderation/posts/{$post->id}/status", [
            'status' => 'rejected',
            'feedback' => 'Requires additional empirical citations.',
        ]);

        $rejected->assertStatus(200)
            ->assertJsonPath('data.status', 'rejected');

        $this->assertEquals('rejected', $post->fresh()->status);
    }

    /**
     * Test reports queue with morphed items.
     */
    public function test_reports_queue_with_morphed_content(): void
    {
        $post = Post::create([
            'user_id' => $this->regularUser->id,
            'category_id' => $this->category->id,
            'title' => 'Reported Post',
            'content' => 'Flagged discussion.',
            'status' => 'published',
        ]);

        $report = Report::create([
            'reporter_id' => $this->regularUser->id,
            'reportable_type' => Post::class,
            'reportable_id' => $post->id,
            'reason' => 'Misinformation',
            'status' => 'pending',
        ]);

        Sanctum::actingAs($this->moderator);
        $response = $this->getJson('/api/moderation/reports');

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonCount(1, 'data.data')
            ->assertJsonPath('data.data.0.id', $report->id)
            ->assertJsonPath('data.data.0.reportable.title', 'Reported Post');
    }

    /**
     * Test resolving reports: dismiss action.
     */
    public function test_resolve_report_dismiss_action(): void
    {
        $post = Post::create([
            'user_id' => $this->regularUser->id,
            'category_id' => $this->category->id,
            'title' => 'Compliant Post',
            'content' => 'Adheres to community charter.',
            'status' => 'published',
        ]);

        $report = Report::create([
            'reporter_id' => $this->regularUser->id,
            'reportable_type' => Post::class,
            'reportable_id' => $post->id,
            'reason' => 'Spam',
            'status' => 'pending',
        ]);

        Sanctum::actingAs($this->moderator);
        $response = $this->postJson("/api/moderation/reports/{$report->id}/resolve", [
            'action' => 'dismiss',
            'moderator_notes' => 'Content follows guidelines; dismissed.',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('data.status', 'dismissed');

        $this->assertEquals('dismissed', $report->fresh()->status);
        $this->assertDatabaseHas('posts', ['id' => $post->id]); // Post remains intact
    }

    /**
     * Test resolving reports: delete_content action deletes offending content and purges storage.
     */
    public function test_resolve_report_delete_content_action(): void
    {
        Storage::fake('public');

        $post = Post::create([
            'user_id' => $this->regularUser->id,
            'category_id' => $this->category->id,
            'title' => 'Violating Article',
            'content' => 'Direct violation of community standards.',
            'status' => 'published',
        ]);

        $fakeMedia = UploadedFile::fake()->image('infringing_diagram.png');
        $storedPath = $fakeMedia->storeAs('posts', 'infringing.png', 'public');

        PostMedia::create([
            'post_id' => $post->id,
            'file_path' => $storedPath,
            'media_type' => 'image',
        ]);

        $report = Report::create([
            'reporter_id' => $this->regularUser->id,
            'reportable_type' => Post::class,
            'reportable_id' => $post->id,
            'reason' => 'Disrespectful behavior',
            'status' => 'pending',
        ]);

        Storage::disk('public')->assertExists($storedPath);

        Sanctum::actingAs($this->admin);
        $response = $this->postJson("/api/moderation/reports/{$report->id}/resolve", [
            'action' => 'delete_content',
            'moderator_notes' => 'Violating post deleted.',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('data.status', 'reviewed');

        // Post and PostMedia must be removed from database
        $this->assertDatabaseMissing('posts', ['id' => $post->id]);
        $this->assertDatabaseMissing('post_media', ['file_path' => $storedPath]);

        // Physical file must be purged from storage
        Storage::disk('public')->assertMissing($storedPath);
    }
}
