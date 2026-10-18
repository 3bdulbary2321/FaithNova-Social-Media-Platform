<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Comment;
use App\Models\Post;
use App\Models\PostMedia;
use App\Models\Reaction;
use App\Models\Report;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database with FaithNova initial dataset.
     */
    public function run(): void
    {
        // ---------------------------------------------------------
        // 1. Seed Categories
        // ---------------------------------------------------------
        $categoriesData = [
            [
                'name' => 'Astronomy',
                'slug' => 'astronomy',
                'description' => 'Exploration of physical cosmology, celestial mechanics, cosmic origins, and astrophysical phenomena.',
            ],
            [
                'name' => 'Biology',
                'slug' => 'biology',
                'description' => 'The study of living organisms, cellular biochemistry, genomics, and ecological harmonies.',
            ],
            [
                'name' => 'Medicine',
                'slug' => 'medicine',
                'description' => 'Physiology, embryology, neurobiology, and the holistic healing arts throughout human civilization.',
            ],
            [
                'name' => 'Physics',
                'slug' => 'physics',
                'description' => 'Fundamental forces, relativistic mechanics, quantum field theory, and cosmic fine-tuning.',
            ],
            [
                'name' => 'History',
                'slug' => 'history',
                'description' => 'Historical scholarship on polymaths, scientific golden ages, and the evolution of empirical thought.',
            ],
        ];

        $categories = [];
        foreach ($categoriesData as $cat) {
            $categories[$cat['slug']] = Category::firstOrCreate(['slug' => $cat['slug']], $cat);
        }

        // ---------------------------------------------------------
        // 2. Seed Users
        // ---------------------------------------------------------
        $admin = User::firstOrCreate(
            ['email' => 'admin@faithnova.com'],
            [
                'name' => 'FaithNova Admin',
                'username' => 'admin',
                'password' => Hash::make('password123'),
                'avatar' => 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=250&auto=format&fit=crop&q=80',
                'bio' => 'Lead System Administrator & Academic Integrity Curator at FaithNova.',
                'role' => 'admin',
            ]
        );

        $moderator = User::firstOrCreate(
            ['email' => 'tariq@faithnova.com'],
            [
                'name' => 'Dr. Tariq Al-Mansoor',
                'username' => 'talmansoor',
                'password' => Hash::make('password123'),
                'avatar' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=250&auto=format&fit=crop&q=80',
                'bio' => 'Astrophysicist & Comparative Theologian, University of Oxford. Investigating cosmological contingency models.',
                'role' => 'moderator',
            ]
        );

        $marcus = User::firstOrCreate(
            ['email' => 'marcus@faithnova.com'],
            [
                'name' => 'Dr. Marcus Vance',
                'username' => 'marcus_vance',
                'password' => Hash::make('password123'),
                'avatar' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=250&auto=format&fit=crop&q=80',
                'bio' => 'Astrophysicist at Kavli Institute for Astrophysics and Space Research (MIT).',
                'role' => 'user',
            ]
        );

        $amina = User::firstOrCreate(
            ['email' => 'amina@faithnova.com'],
            [
                'name' => 'Prof. Amina El-Khatib',
                'username' => 'amina_elkhatib',
                'password' => Hash::make('password123'),
                'avatar' => 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=250&auto=format&fit=crop&q=80',
                'bio' => 'Biophysicist & Molecular Biologist at University of Cambridge.',
                'role' => 'user',
            ]
        );

        $julian = User::firstOrCreate(
            ['email' => 'julian@faithnova.com'],
            [
                'name' => 'Dr. Julian Sterling',
                'username' => 'jsterling',
                'password' => Hash::make('password123'),
                'avatar' => 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=250&auto=format&fit=crop&q=80',
                'bio' => 'Historian of Science & Scholastic Epistemology.',
                'role' => 'user',
            ]
        );

        // ---------------------------------------------------------
        // 3. Seed Posts (Dual-Referenced)
        // ---------------------------------------------------------
        $post1 = Post::create([
            'user_id' => $marcus->id,
            'category_id' => $categories['astronomy']->id,
            'title' => 'Cosmic Singularity, Inflation, and Pre-Modern Descriptions of Spacetime Genesis',
            'content' => 'The standard Friedmann-Lemaître-Robertson-Walker (FLRW) metric alongside Penrose-Hawking singularity theorems indicates that physical matter, energy, and spacetime emerged from a boundary state approximately 13.8 billion years ago. Rather than an explosion within pre-existing space, contemporary astrophysics models this as the rapid metric expansion of space itself. This physical framework provides a compelling lens through which to examine classical cosmological exegesis regarding cosmic origins.',
            'religious_reference' => "Surah Al-Anbiya (21:30): \"Do not the disbelievers see that the heavens and the earth were a closed-up mass (ratqan), then We opened them out (fataqnāhumā)? And We made from water every living thing.\"\n\nClassical Lexicography: Ibn Manzur in Lisan al-Arab defines 'ratq' as an impermeable, singular fused mass before differentiation, and 'fatq' as deliberate cleaving apart—strikingly harmonious with an initial high-density singularity undergoing cosmic expansion.",
            'scientific_reference' => "Physical Review Letters (2024) — DOI: 10.1103/PhysRevLett.132.081401\nAnalysis of cosmic microwave background (CMB) anisotropies gathered by the Planck observatory and BICEP array confirms a nearly scale-invariant spectrum of primordial curvature perturbations, directly supporting a phase where space rapidly expanded from Planck-density conditions.",
            'status' => 'published',
        ]);

        $post2 = Post::create([
            'user_id' => $amina->id,
            'category_id' => $categories['biology']->id,
            'title' => 'Cellular Hydrodynamics: Water as the Indispensable Matrix for Biological Life',
            'content' => 'Water possesses extraordinary thermodynamic anomalies—including its high specific heat capacity, anomalous density peak at 4°C, and exceptional dielectric constant—which make it the uniquely suited chemical substrate for folding proteins, stabilizing lipid bilayer membranes, and enabling metabolic proton transfers. Life on Earth is fundamentally aqueous down to the quantum scale.',
            'religious_reference' => "Surah An-Nur (24:45): \"And God has created every animal from water: of them there are some that creep on their bellies; some that walk on two legs; and some that walk on four. God creates what He wills: for truly God has power over all things.\"",
            'scientific_reference' => "Nature Reviews Molecular Cell Biology (2023) — DOI: 10.1038/s41580-023-00592-z\nStructural biology investigations reveal that hydration shells are not passive bystanders, but active mechanical drivers of catalytic enzyme kinetics and macromolecular conformational states.",
            'status' => 'published',
        ]);

        $post3 = Post::create([
            'user_id' => $moderator->id,
            'category_id' => $categories['physics']->id,
            'title' => 'Subatomic Fine-Tuning, Cosmological Constants, and Ontological Contingency',
            'content' => 'The cosmological constant Lambda (Λ) is famously fine-tuned to roughly 1 part in 10^120. If the strong nuclear force were altered by mere percentiles, stable nucleosynthesis of carbon and oxygen inside stellar furnaces would be thermodynamically precluded. Physical constants exhibit precision that invites profound metaphysical inquiries regarding contingency and design.',
            'religious_reference' => "Surah Al-Mulk (67:3-4): \"[He] who created seven heavens in layers. You do not see in the creation of the Most Merciful any inconsistency. So return your vision to the sky, do you see any breaks? Then return your vision twice again, your vision will return to you humbled while it is fatigued.\"",
            'scientific_reference' => "Reviews of Modern Physics — \"The Fine-Tuning of the Universe for Intelligent Life\"\nMartin Rees & Steven Weinberg: Calculations regarding the anthropic bounds on the cosmological constant demonstrate an extremely narrow viability corridor for galaxy formation and biogenesis.",
            'status' => 'published',
        ]);

        $post4Pending = Post::create([
            'user_id' => $julian->id,
            'category_id' => $categories['history']->id,
            'title' => 'Al-Hasan Ibn al-Haytham, the Camera Obscura, and the Empirical Scientific Revolution',
            'content' => 'In his monumental Kitab al-Manazir (Book of Optics, c. 1021 CE), Ibn al-Haytham overturned Ptolemaic and Euclidean emission theories of vision through controlled optical experimentation. He established systematic falsification centuries before Bacon and Descartes, consciously motivated by theological convictions that human sensory perception requires rigorous empirical verification.',
            'religious_reference' => "Classical Scholar Quote (Ibn al-Haytham, Kitab al-Manazir Prologue): \"The seeker after the truth is not one who studies the writings of the ancients and puts his trust in them, but rather the one who suspects his faith in them and questions what he gathers from them, following argument and demonstration rather than human authority.\"",
            'scientific_reference' => "Nature Photonics (2015) — \"Ibn al-Haytham: Father of Modern Optics\"\nHistorical physics assessment demonstrating that Ibn al-Haytham's mathematical formulations of ray reflection and refraction laid the direct groundwork for Fermat's principle of least time.",
            'status' => 'pending',
        ]);

        // ---------------------------------------------------------
        // 4. Seed Post Media
        // ---------------------------------------------------------
        PostMedia::create([
            'post_id' => $post1->id,
            'file_path' => 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1000&auto=format&fit=crop&q=80',
            'media_type' => 'image',
        ]);

        PostMedia::create([
            'post_id' => $post1->id,
            'file_path' => 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1000&auto=format&fit=crop&q=80',
            'media_type' => 'image',
        ]);

        PostMedia::create([
            'post_id' => $post2->id,
            'file_path' => 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=1000&auto=format&fit=crop&q=80',
            'media_type' => 'image',
        ]);

        PostMedia::create([
            'post_id' => $post3->id,
            'file_path' => 'https://example.com/documents/cosmological-fine-tuning-monograph.pdf',
            'media_type' => 'document',
        ]);

        // ---------------------------------------------------------
        // 5. Seed Comments & Nested Replies
        // ---------------------------------------------------------
        $rootComment1 = Comment::create([
            'post_id' => $post1->id,
            'user_id' => $amina->id,
            'parent_id' => null,
            'content' => 'The semantic alignment on "ratq" is particularly compelling when contrasted with the steady-state model that dominated early 20th-century physics prior to Hubble’s discoveries. Have you considered contrasting this with the Lemaître primeval atom hypothesis?',
        ]);

        // Nested reply
        Comment::create([
            'post_id' => $post1->id,
            'user_id' => $marcus->id,
            'parent_id' => $rootComment1->id,
            'content' => 'Precisely, Prof. El-Khatib! Georges Lemaître himself emphasized that the primeval atom hypothesis represents an ontological beginning in physical coordinates, without conflating mathematical models directly with metaphysical dogma.',
        ]);

        $rootComment2 = Comment::create([
            'post_id' => $post1->id,
            'user_id' => $julian->id,
            'parent_id' => null,
            'content' => 'Fascinating synthesis. Classical commentators like Fakhr al-Din al-Razi also discussed multiple world hypotheses in his Mafatih al-Ghayb, which resonates remarkably with modern multiverse conjectures.',
        ]);

        Comment::create([
            'post_id' => $post2->id,
            'user_id' => $marcus->id,
            'parent_id' => null,
            'content' => 'The dipole moment and hydrogen bonding network of liquid water continue to surprise physical chemists even in ultrafast femtosecond spectroscopy.',
        ]);

        // ---------------------------------------------------------
        // 6. Seed Reactions
        // ---------------------------------------------------------
        Reaction::create([
            'post_id' => $post1->id,
            'user_id' => $admin->id,
            'type' => 'insightful',
        ]);

        Reaction::create([
            'post_id' => $post1->id,
            'user_id' => $amina->id,
            'type' => 'like',
        ]);

        Reaction::create([
            'post_id' => $post1->id,
            'user_id' => $moderator->id,
            'type' => 'insightful',
        ]);

        Reaction::create([
            'post_id' => $post2->id,
            'user_id' => $julian->id,
            'type' => 'like',
        ]);

        Reaction::create([
            'post_id' => $post3->id,
            'user_id' => $admin->id,
            'type' => 'insightful',
        ]);

        // ---------------------------------------------------------
        // 7. Seed Reports (Polymorphic: Posts & Comments)
        // ---------------------------------------------------------
        Report::create([
            'reporter_id' => $amina->id,
            'reportable_type' => Post::class,
            'reportable_id' => $post4Pending->id,
            'reason' => 'Off-topic or Needs Verification',
            'notes' => 'Checking if this historical analysis requires additional secondary peer-reviewed references before publication.',
            'status' => 'pending',
        ]);

        Report::create([
            'reporter_id' => $julian->id,
            'reportable_type' => Comment::class,
            'reportable_id' => $rootComment2->id,
            'reason' => 'Test Report Flag',
            'notes' => 'Sample moderation flag for comment review verification.',
            'status' => 'dismissed',
        ]);
    }
}
