<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Comment;
use App\Models\Post;
use App\Models\Reaction;
use App\Models\Report;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class Phase4InteractionTest extends TestCase
{
    use RefreshDatabase;

    protected User $author;
    protected User $reader;
    protected User $moderator;
    protected Category $category;
    protected Post $post;

    protected function setUp(): void
    {
        parent::setUp();

        $this->author = User::factory()->create([
            'name' => 'Dr. Marcus Vance',
            'username' => 'marcus_vance',
            'role' => 'user',
        ]);

        $this->reader = User::factory()->create([
            'name' => 'Prof. Amina El-Khatib',
            'username' => 'amina_khatib',
            'role' => 'user',
        ]);

        $this->moderator = User::factory()->create([
            'name' => 'Dr. Tariq Al-Mansoor',
            'username' => 'talmansoor',
            'role' => 'moderator',
        ]);

        $this->category = Category::create([
            'name' => 'Astrophysics',
            'slug' => 'astrophysics',
            'description' => 'Cosmology and celestial mechanics.',
        ]);

        $this->post = Post::create([
            'user_id' => $this->author->id,
            'category_id' => $this->category->id,
            'title' => 'Cosmic Inflation and Primordial Fluctuations',
            'content' => 'Analysis of cosmological boundary conditions.',
            'status' => 'published',
        ]);
    }

    /**
     * Test creating a root comment on a post.
     */
    public function test_user_can_create_root_comment(): void
    {
        Sanctum::actingAs($this->reader);

        $response = $this->postJson("/api/posts/{$this->post->id}/comments", [
            'content' => 'Fascinating alignment with classical theological metaphysics.',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('data.content', 'Fascinating alignment with classical theological metaphysics.')
            ->assertJsonPath('data.parent_id', null)
            ->assertJsonPath('data.author.username', 'amina_khatib')
            ->assertJsonStructure(['data' => ['created_at_human', 'children']]);

        $this->assertDatabaseHas('comments', [
            'post_id' => $this->post->id,
            'user_id' => $this->reader->id,
            'parent_id' => null,
            'content' => 'Fascinating alignment with classical theological metaphysics.',
        ]);
    }

    /**
     * Test creating a nested reply comment.
     */
    public function test_user_can_reply_to_comment(): void
    {
        $rootComment = Comment::create([
            'post_id' => $this->post->id,
            'user_id' => $this->reader->id,
            'parent_id' => null,
            'content' => 'Initial inquiry regarding singularity theorems.',
        ]);

        Sanctum::actingAs($this->author);

        $response = $this->postJson("/api/posts/{$this->post->id}/comments", [
            'content' => 'Indeed, Penrose and Hawking proved that gravitational collapse leads to geodesics termination.',
            'parent_id' => $rootComment->id,
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('data.parent_id', $rootComment->id)
            ->assertJsonPath('data.author.username', 'marcus_vance');

        $this->assertDatabaseHas('comments', [
            'post_id' => $this->post->id,
            'parent_id' => $rootComment->id,
        ]);
    }

    /**
     * Test rejecting replies referencing a parent comment from a different post.
     */
    public function test_cannot_reply_with_parent_id_from_different_post(): void
    {
        $otherPost = Post::create([
            'user_id' => $this->author->id,
            'category_id' => $this->category->id,
            'title' => 'Other Post',
            'content' => 'Unrelated topic.',
            'status' => 'published',
        ]);

        $commentOnOtherPost = Comment::create([
            'post_id' => $otherPost->id,
            'user_id' => $this->author->id,
            'parent_id' => null,
            'content' => 'Comment on another post.',
        ]);

        Sanctum::actingAs($this->reader);

        $response = $this->postJson("/api/posts/{$this->post->id}/comments", [
            'content' => 'Malicious or mismatched reply attempt.',
            'parent_id' => $commentOnOtherPost->id,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['parent_id']);
    }

    /**
     * Test comment update authorization.
     */
    public function test_only_comment_author_can_update_comment(): void
    {
        $comment = Comment::create([
            'post_id' => $this->post->id,
            'user_id' => $this->reader->id,
            'content' => 'Draft thought.',
        ]);

        // Unauthorized user attempt
        Sanctum::actingAs($this->author);
        $unauth = $this->putJson("/api/comments/{$comment->id}", [
            'content' => 'Tampered text.',
        ]);
        $unauth->assertStatus(403);

        // Author attempt
        Sanctum::actingAs($this->reader);
        $auth = $this->putJson("/api/comments/{$comment->id}", [
            'content' => 'Polished academic inquiry.',
        ]);
        $auth->assertStatus(200)
            ->assertJsonPath('data.content', 'Polished academic inquiry.');
    }

    /**
     * Test comment deletion authorization (Author or Moderator).
     */
    public function test_comment_deletion_permissions(): void
    {
        $comment = Comment::create([
            'post_id' => $this->post->id,
            'user_id' => $this->reader->id,
            'content' => 'Comment to delete.',
        ]);

        $otherUser = User::factory()->create(['role' => 'user']);
        Sanctum::actingAs($otherUser);
        $unauth = $this->deleteJson("/api/comments/{$comment->id}");
        $unauth->assertStatus(403);

        // Moderator can delete
        Sanctum::actingAs($this->moderator);
        $modDelete = $this->deleteJson("/api/comments/{$comment->id}");
        $modDelete->assertStatus(200);

        $this->assertDatabaseMissing('comments', ['id' => $comment->id]);
    }

    /**
     * Test toggling reactions: create, remove when same, update when different.
     */
    public function test_reaction_toggle_cycle(): void
    {
        Sanctum::actingAs($this->reader);

        // 1. Initial reaction -> creates 'like'
        $resp1 = $this->postJson("/api/posts/{$this->post->id}/reactions", ['type' => 'like']);
        $resp1->assertStatus(200)
            ->assertJsonPath('action', 'added')
            ->assertJsonPath('user_reaction', 'like')
            ->assertJsonPath('stats.likes_count', 1)
            ->assertJsonPath('stats.insightfuls_count', 0);

        $this->assertDatabaseHas('reactions', [
            'post_id' => $this->post->id,
            'user_id' => $this->reader->id,
            'type' => 'like',
        ]);

        // 2. Change reaction type -> updates to 'insightful'
        $resp2 = $this->postJson("/api/posts/{$this->post->id}/reactions", ['type' => 'insightful']);
        $resp2->assertStatus(200)
            ->assertJsonPath('action', 'updated')
            ->assertJsonPath('user_reaction', 'insightful')
            ->assertJsonPath('stats.likes_count', 0)
            ->assertJsonPath('stats.insightfuls_count', 1);

        $this->assertDatabaseHas('reactions', [
            'post_id' => $this->post->id,
            'user_id' => $this->reader->id,
            'type' => 'insightful',
        ]);

        // 3. Click same reaction ('insightful') again -> un-reacts / removes
        $resp3 = $this->postJson("/api/posts/{$this->post->id}/reactions", ['type' => 'insightful']);
        $resp3->assertStatus(200)
            ->assertJsonPath('action', 'removed')
            ->assertJsonPath('user_reaction', null)
            ->assertJsonPath('stats.likes_count', 0)
            ->assertJsonPath('stats.insightfuls_count', 0);

        $this->assertDatabaseMissing('reactions', [
            'post_id' => $this->post->id,
            'user_id' => $this->reader->id,
        ]);
    }

    /**
     * Test polymorphic reporting on a Post and on a Comment.
     */
    public function test_user_can_report_post_and_comment(): void
    {
        $comment = Comment::create([
            'post_id' => $this->post->id,
            'user_id' => $this->author->id,
            'content' => 'Controversial hypothesis.',
        ]);

        Sanctum::actingAs($this->reader);

        // Report Post
        $postReport = $this->postJson('/api/reports', [
            'reportable_type' => 'post',
            'reportable_id' => $this->post->id,
            'reason' => 'Misinformation',
            'notes' => 'Requires verification with Planck 2018 datasets.',
        ]);

        $postReport->assertStatus(201)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('data.reportable_type', 'Post')
            ->assertJsonPath('data.reportable_id', $this->post->id)
            ->assertJsonPath('data.reason', 'Misinformation');

        $this->assertDatabaseHas('reports', [
            'reporter_id' => $this->reader->id,
            'reportable_type' => Post::class,
            'reportable_id' => $this->post->id,
            'status' => 'pending',
        ]);

        // Report Comment
        $commentReport = $this->postJson('/api/reports', [
            'reportable_type' => 'comment',
            'reportable_id' => $comment->id,
            'reason' => 'Disrespectful behavior',
        ]);

        $commentReport->assertStatus(201)
            ->assertJsonPath('data.reportable_type', 'Comment');

        // Prevent duplicate pending report on the same post
        $duplicate = $this->postJson('/api/reports', [
            'reportable_type' => 'post',
            'reportable_id' => $this->post->id,
            'reason' => 'Misinformation',
        ]);
        $duplicate->assertStatus(409)
            ->assertJsonPath('status', 'error');
    }
}
