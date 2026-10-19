<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Post;
use App\Models\PostMedia;
use App\Models\Reaction;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class Phase3PostAndCategoryTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected User $otherUser;
    protected User $admin;
    protected User $moderator;
    protected Category $category;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create(['role' => 'user']);
        $this->otherUser = User::factory()->create(['role' => 'user']);
        $this->admin = User::factory()->create(['role' => 'admin']);
        $this->moderator = User::factory()->create(['role' => 'moderator']);

        $this->category = Category::create([
            'name' => 'Cosmology & Astrophysics',
            'slug' => 'cosmology-astrophysics',
            'description' => 'Academic discourse on early universe physics and cosmological models.',
        ]);
    }

    /**
     * Test categories listing with post counts.
     */
    public function test_can_list_categories_with_post_counts(): void
    {
        Post::create([
            'user_id' => $this->user->id,
            'category_id' => $this->category->id,
            'title' => 'Cosmic Origins',
            'content' => 'Content on inflationary cosmology.',
            'status' => 'published',
        ]);

        $response = $this->getJson('/api/categories');

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('data.0.slug', 'cosmology-astrophysics')
            ->assertJsonPath('data.0.posts_count', 1);
    }

    /**
     * Test admin can create category, non-admin gets 403.
     */
    public function test_category_management_permissions(): void
    {
        // Non-admin attempt should be forbidden
        $userResponse = $this->actingAs($this->user)->postJson('/api/categories', [
            'name' => 'Quantum Biophysics',
        ]);
        $userResponse->assertStatus(403);

        // Admin attempt should succeed
        $adminResponse = $this->actingAs($this->admin)->postJson('/api/categories', [
            'name' => 'Quantum Biophysics',
            'description' => 'Subatomic biological processes.',
        ]);
        $adminResponse->assertStatus(201)
            ->assertJsonPath('data.slug', 'quantum-biophysics');

        $this->assertDatabaseHas('categories', ['slug' => 'quantum-biophysics']);
    }

    /**
     * Test category posts endpoint.
     */
    public function test_can_fetch_posts_for_specific_category(): void
    {
        Post::create([
            'user_id' => $this->user->id,
            'category_id' => $this->category->id,
            'title' => 'Metric Expansion',
            'content' => 'Friedmann equations and dark energy expansion.',
            'status' => 'published',
        ]);

        $response = $this->getJson("/api/categories/{$this->category->slug}/posts");

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('category.slug', $this->category->slug)
            ->assertJsonCount(1, 'posts.data');
    }

    /**
     * Test post creation with multiple multimedia uploads in DB Transaction.
     */
    public function test_authenticated_user_can_create_post_with_media(): void
    {
        Storage::fake('public');

        $fakeImage = UploadedFile::fake()->image('diagram.png', 600, 600);
        $fakePdf = UploadedFile::fake()->create('research_paper.pdf', 500, 'application/pdf');

        $payload = [
            'category_id' => $this->category->id,
            'title' => 'Thermodynamic Entropy and the Arrow of Time',
            'content' => 'The second law of thermodynamics establishes a distinct statistical directionality for macroscopic systems.',
            'religious_reference' => 'Surah Fatir (35:1): All praise is for Allah, the Originator of the heavens and the earth.',
            'scientific_reference' => 'Physical Review E — Statistical mechanics of non-equilibrium states.',
            'media' => [$fakeImage, $fakePdf],
        ];

        $response = $this->actingAs($this->user)->postJson('/api/posts', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('data.title', 'Thermodynamic Entropy and the Arrow of Time')
            ->assertJsonCount(2, 'data.media');

        $this->assertDatabaseHas('posts', [
            'user_id' => $this->user->id,
            'title' => 'Thermodynamic Entropy and the Arrow of Time',
        ]);

        $post = Post::where('title', 'Thermodynamic Entropy and the Arrow of Time')->first();
        $this->assertCount(2, $post->media);

        // Verify media files were saved on public disk
        foreach ($post->media as $mediaItem) {
            Storage::disk('public')->assertExists($mediaItem->file_path);
        }
    }

    /**
     * Test post search with keyword.
     */
    public function test_can_search_posts(): void
    {
        Post::create([
            'user_id' => $this->user->id,
            'category_id' => $this->category->id,
            'title' => 'Quantum Entanglement in Biological Enzymes',
            'content' => 'Investigating non-local correlation in avian magnetoreception cryptochromes.',
            'status' => 'published',
        ]);

        $response = $this->getJson('/api/posts/search?q=Entanglement');

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonCount(1, 'data.data');

        $responseEmpty = $this->getJson('/api/posts/search?q=');
        $responseEmpty->assertStatus(422);
    }

    /**
     * Test post show with reaction state.
     */
    public function test_post_show_returns_user_reaction_state(): void
    {
        $post = Post::create([
            'user_id' => $this->user->id,
            'category_id' => $this->category->id,
            'title' => 'Fine-Tuning Parameters',
            'content' => 'Dimensionless coupling constants and cosmological stability.',
            'status' => 'published',
        ]);

        Reaction::create([
            'post_id' => $post->id,
            'user_id' => $this->otherUser->id,
            'type' => 'insightful',
        ]);

        // When viewing as the user who reacted
        \Laravel\Sanctum\Sanctum::actingAs($this->otherUser);
        $response = $this->getJson("/api/posts/{$post->id}");

        $response->assertStatus(200)
            ->assertJsonPath('data.user_reaction', 'insightful')
            ->assertJsonPath('data.stats.insightfuls_count', 1);

        // When viewing as a user who hasn't reacted
        \Laravel\Sanctum\Sanctum::actingAs($this->user);
        $responseUnreacted = $this->getJson("/api/posts/{$post->id}");
        $responseUnreacted->assertStatus(200)
            ->assertJsonPath('data.user_reaction', null);
    }

    /**
     * Test update authorization.
     */
    public function test_post_update_authorization(): void
    {
        $post = Post::create([
            'user_id' => $this->user->id,
            'category_id' => $this->category->id,
            'title' => 'Initial Title',
            'content' => 'Initial Content',
            'status' => 'published',
        ]);

        // Non-owner unauthorized attempt
        $unauthResponse = $this->actingAs($this->otherUser)->putJson("/api/posts/{$post->id}", [
            'title' => 'Hacked Title',
        ]);
        $unauthResponse->assertStatus(403);

        // Owner attempt succeeds
        $ownerResponse = $this->actingAs($this->user)->putJson("/api/posts/{$post->id}", [
            'title' => 'Revised Title',
        ]);
        $ownerResponse->assertStatus(200)
            ->assertJsonPath('data.title', 'Revised Title');
    }

    /**
     * Test post deletion cleans up physical storage files.
     */
    public function test_post_deletion_cleans_up_storage_files(): void
    {
        Storage::fake('public');

        $post = Post::create([
            'user_id' => $this->user->id,
            'category_id' => $this->category->id,
            'title' => 'Post to Delete',
            'content' => 'Will be purged alongside media.',
            'status' => 'published',
        ]);

        $fakeFile = UploadedFile::fake()->image('chart.jpg');
        $storedPath = $fakeFile->storeAs('posts', 'test_chart.jpg', 'public');

        PostMedia::create([
            'post_id' => $post->id,
            'file_path' => $storedPath,
            'media_type' => 'image',
        ]);

        Storage::disk('public')->assertExists($storedPath);

        $response = $this->actingAs($this->user)->deleteJson("/api/posts/{$post->id}");

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success');

        $this->assertDatabaseMissing('posts', ['id' => $post->id]);
        $this->assertDatabaseMissing('post_media', ['file_path' => $storedPath]);

        // Physical file should be purged
        Storage::disk('public')->assertMissing($storedPath);
    }
}
