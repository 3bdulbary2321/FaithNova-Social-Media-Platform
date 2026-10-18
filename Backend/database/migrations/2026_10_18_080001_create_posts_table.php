<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('posts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('category_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->longText('content');
            $table->text('religious_reference')->nullable();
            $table->text('scientific_reference')->nullable();
            $table->enum('status', ['pending', 'published', 'rejected'])->default('published');
            $table->timestamps();

            // FullText search index across title, content, and both references (MySQL/MariaDB/PostgreSQL)
            if (Schema::getConnection()->getDriverName() !== 'sqlite') {
                $table->fullText(['title', 'content', 'religious_reference', 'scientific_reference'], 'posts_fulltext_search');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('posts');
    }
};
