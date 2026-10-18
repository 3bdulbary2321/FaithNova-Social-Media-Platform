export const sampleFeedPosts = [
  {
    id: 'post-1',
    category: 'Astronomy',
    author: {
      name: 'Dr. Marcus Vance',
      handle: '@marcus_vance',
      roleBadge: 'Astrophysicist',
      badgeType: 'science', // 'science' (indigo), 'theology' (amber), 'bio' (emerald)
      institution: 'MIT Kavli Institute for Astrophysics',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      isVerified: true,
    },
    timestamp: '2 hours ago',
    title: 'Cosmic Singularity, Inflation, and Pre-Modern Descriptions of Spacetime Genesis',
    content: 'The standard Friedmann-Lemaître-Robertson-Walker (FLRW) metric alongside Penrose-Hawking singularity theorems indicates that both physical matter and time itself emerged from a boundary state approximately 13.8 billion years ago. Rather than an explosion of matter into pre-existing empty space, contemporary astrophysics models this as the rapid expansion of metric space itself. This physical framework provides a compelling lens through which to examine classical cosmological exegesis regarding the origin of the cosmos.',
    tags: ['Cosmology', 'BigBang', 'GeneralRelativity', 'CosmicOrigins'],
    
    // Religious Reference Highlight Box
    religiousReference: {
      source: 'The Holy Qur\'an — Surah Al-Anbiya (21:30)',
      scripture: 'Do not the disbelievers see that the heavens and the earth were a closed-up mass (ratqan), then We opened them out (fataqnāhumā)? And We made from water every living thing. Will they not then believe?',
      exegesis: 'Classical lexicographer Ibn Manzur in Lisan al-Arab notes that "ratq" signifies an impermeable, singular fused mass before separation, while "fatq" denotes deliberate cleaving apart—strikingly harmonious with an initial high-density singularity undergoing cosmic inflation.',
      tradition: 'Classical Exegesis & Semantics',
    },

    // Scientific Explanation Highlight Box
    scientificReference: {
      field: 'Physical Cosmology & Relativistic Mechanics',
      citation: 'Physical Review Letters (2024) — DOI: 10.1103/PhysRevLett.132.081401',
      paperTitle: 'Non-Singular Quantum Bounces and Metric Perturbations in Early-Universe Inflation',
      explanation: 'Analysis of cosmic microwave background (CMB) anisotropies gathered by the Planck observatory and BICEP array confirms a nearly scale-invariant spectrum of primordial curvature perturbations, directly supporting a phase where space rapidly expanded from Planck-density conditions.',
    },

    // Multimedia: Image Gallery
    media: {
      type: 'image',
      items: [
        {
          url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1000&auto=format&fit=crop&q=80',
          caption: 'Cosmic Microwave Background & Deep Space Metric Expansion (NASA / ESA / Planck Collaboration)',
          alt: 'Deep space galaxy cluster and cosmic nebula',
        },
        {
          url: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1000&auto=format&fit=crop&q=80',
          caption: 'JWST High-Redshift Starburst Galaxy Field',
          alt: 'Galaxy nebula colors in deep space',
        }
      ]
    },

    stats: {
      likes: 342,
      insightfuls: 215,
      commentsCount: 48,
      shares: 63,
    },
    comments: [
      {
        id: 'c-1',
        author: {
          name: 'Prof. Amina El-Khatib',
          avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
          roleBadge: 'Biophysicist',
          institution: 'University of Cambridge',
          isVerified: true,
        },
        timestamp: '1 hour ago',
        text: 'The semantic alignment on "ratq" is particularly compelling when contrasted with the steady-state model that dominated early 20th-century physics prior to Hubble’s discoveries. Have you considered contrasting this with the Lemaître primeval atom hypothesis?',
        likes: 24,
        isLiked: false,
        replies: [
          {
            id: 'reply-1-1',
            author: {
              name: 'Dr. Marcus Vance',
              avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
              roleBadge: 'Astrophysicist',
              institution: 'MIT Kavli Institute',
              isVerified: true,
            },
            timestamp: '45 mins ago',
            text: 'Indeed, Georges Lemaître himself—as both an ordained priest and a mathematical physicist—cautioned against conflating physical cosmogenesis with metaphysical creation ex nihilo, though the mathematical parallels remain philosophically potent.',
            likes: 18,
            isLiked: true,
            replies: [
              {
                id: 'reply-1-1-1',
                author: {
                  name: 'Dr. Zayd Al-Ghazali',
                  avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
                  roleBadge: 'Theologian',
                  institution: 'Oxford & Al-Azhar',
                  isVerified: true,
                },
                timestamp: '20 mins ago',
                text: 'Precisely. In classical Kalam, al-Ghazali distinguishes between "hudūth" (temporal origination) and the ontic contingency of the cosmos, which mirrors Lemaître\'s distinction between physical beginnings and metaphysical dependence.',
                likes: 9,
                isLiked: false,
                replies: []
              }
            ]
          }
        ]
      },
      {
        id: 'c-2',
        author: {
          name: 'Dr. Sarah Chen-Davies',
          avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop&q=80',
          roleBadge: 'Neuroscientist',
          institution: 'Stanford University',
          isVerified: true,
        },
        timestamp: '30 mins ago',
        text: 'The epistemic humility emphasized in your thesis is exemplary. When we examine cosmological constants, separating empirical boundary limits from theological claims keeps both disciplines intellectually honest.',
        likes: 15,
        isLiked: false,
        replies: []
      }
    ]
  },

  {
    id: 'post-2',
    category: 'Medicine',
    author: {
      name: 'Dr. Fatima Zahra Al-Husseini',
      handle: '@f_husseini',
      roleBadge: 'Medical Geneticist & Bioethicist',
      badgeType: 'bio',
      institution: 'Johns Hopkins School of Medicine',
      avatar: 'https://images.unsplash.com/photo-1594824813568-71e84733470b?w=150&auto=format&fit=crop&q=80',
      isVerified: true,
    },
    timestamp: '4 hours ago',
    title: 'Morphogenetic Staging in Human Embryology: Comparative Histology and Medieval Semantics',
    content: 'Human prenatal morphogenesis proceeds through sequential biological thresholds: blastogenesis, gastrulation, somite formation, and osteogenesis followed by myogenesis. Historically, 7th-century descriptions recorded distinct developmental phases using qualitative terminology. When scrutinized under modern scanning electron microscopy (SEM) and Carnegie staging standards, the chronological succession of tissue differentiation reveals intriguing developmental milestones.',
    tags: ['Embryology', 'Histology', 'Bioethics', 'DevelopmentalBiology'],

    // Religious Reference Highlight Box
    religiousReference: {
      source: 'The Holy Qur\'an — Surah Al-Mu\'minun (23:12–14)',
      scripture: 'And certainly did We create man from an extract of clay. Then We made him a nutfah in a firm lodge. Then We made the nutfah into an ‘alaqah (clinging clot), and We made the ‘alaqah into a mudghah (chewed lump), then We made the mudghah into bones, and clothed the bones with flesh (lahm)...',
      exegesis: 'The progression from ‘alaqah (clinging suspension/blastocyst implantation) to mudghah (resembling somite indentations like teeth marks on a chewed piece of gum) corresponds accurately to Carnegie Stages 9 through 14.',
      tradition: 'Classical Exegesis & Anatomo-Clinical History',
    },

    // Scientific Explanation Highlight Box
    scientificReference: {
      field: 'Human Morphogenesis & Developmental Histology',
      citation: 'Cell Stem Cell (2025) — DOI: 10.1016/j.stem.2025.01.008',
      paperTitle: 'Single-Cell Transcriptomics of Axial Somite Segmentation in Human Blastoids',
      explanation: 'Recent 3D gastruloid models demonstrate that paraxial mesoderm somite segmentation occurs prior to chondrogenesis (bone cartilage framework), strictly preceding secondary myogenesis (striated muscle migration and wrapping).',
    },

    // Multimedia: PDF Document Preview
    media: {
      type: 'pdf',
      document: {
        title: 'Histological_Correlation_Carnegie_Stages_v3.pdf',
        fileSize: '4.2 MB',
        pagesCount: 28,
        description: 'Peer-reviewed comparative analysis between Carnegie Stages 8-16 and classical Mediterranean medical descriptions.',
        downloadUrl: '#',
      }
    },

    stats: {
      likes: 512,
      insightfuls: 394,
      commentsCount: 67,
      shares: 114,
    },
    comments: [
      {
        id: 'c-3',
        author: 'Dr. Tariq Al-Mansoor',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
        role: 'Physicist',
        time: '2 hours ago',
        text: 'The distinction that cartilage scaffolding precedes muscle wrapping is an astonishing anatomical observation given the absence of compound optical magnification at the time.'
      }
    ]
  },

  {
    id: 'post-3',
    category: 'Physics',
    author: {
      name: 'Prof. Julian Thorne',
      handle: '@j_thorne_phys',
      roleBadge: 'Quantum Foundations Fellow',
      badgeType: 'science',
      institution: 'Perimeter Institute for Theoretical Physics',
      avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80',
      isVerified: true,
    },
    timestamp: '7 hours ago',
    title: 'Quantum Entanglement, Non-Locality, and Non-Reductionist Metaphysics',
    content: 'Aspect and Clauser’s experimental violations of Bell inequalities dismantled Einstein’s local hidden-variable hypothesis. Subatomic particles separated across astronomical light-years display instantaneous correlation upon measurement without energy transfer across spacetime. Rather than isolated billiard balls, reality at its foundational layer is fundamentally holistic and relational. This empirical non-locality dissolves Cartesian dualism and revives pre-modern relational theism.',
    tags: ['QuantumMechanics', 'BellInequality', 'Entanglement', 'Metaphysics'],

    // Religious Reference Highlight Box
    religiousReference: {
      source: 'The Holy Qur\'an — Surah Al-Hadid (57:3–4)',
      scripture: 'He is the First and the Last, the Manifest and the Hidden, and He is Knower of all things. It is He who created the heavens and earth in six days and then established Himself above the Throne. He knows what enters into the earth and what emerges from it... and He is with you wherever you are.',
      exegesis: 'Theological commentaries on Divine Omnipresence (Ma\'iyyah) emphasize that God\'s knowledge and sustaining power are immediate and unmediated by spatial distances or temporal delays.',
      tradition: 'Philosophical Theology & Divine Attributes',
    },

    // Scientific Explanation Highlight Box
    scientificReference: {
      field: 'Quantum Information & Foundation Theorems',
      citation: 'Nature Physics (2024) — DOI: 10.1038/s41567-024-02450-w',
      paperTitle: 'Loophole-Free Verification of Multi-Party Quantum Teleportation in Optical Fibre Networks',
      explanation: 'Empirical confirmation of quantum state teleportation across 100km networks without local causal signaling verifies that quantum wave-function reduction is non-spatial in its ontic substrate.',
    },

    // Multimedia: Interactive Video Player Preview
    media: {
      type: 'video',
      video: {
        title: 'Quantum Decoherence and the Metaphysics of Being (Perimeter Colloquium)',
        duration: '14:20',
        poster: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=1000&auto=format&fit=crop&q=80',
        views: '4.8k views',
        speaker: 'Prof. Julian Thorne with guest discussant Dr. Zayd Al-Ghazali'
      }
    },

    stats: {
      likes: 428,
      insightfuls: 310,
      commentsCount: 39,
      shares: 88,
    },
    comments: []
  },

  {
    id: 'post-4',
    category: 'Biology',
    author: {
      name: 'Prof. Amina El-Khatib',
      handle: '@amina_elkhatib',
      roleBadge: 'Biophysicist & Molecular Biologist',
      badgeType: 'bio',
      institution: 'University of Cambridge',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      isVerified: true,
    },
    timestamp: '11 hours ago',
    title: 'ATP Synthase: Rotary Molecular Nanomachinery and the Teleological Architecture of Living Matter',
    content: 'Within the inner mitochondrial membrane, the F1FO-ATP synthase rotor spins at nearly 8,000 RPM, converting electrochemical proton gradient energy into adenosine triphosphate with near 100% thermodynamic efficiency. The sub-nanometer coordination between the central stalk and stator ring operates with mechanical tolerances superior to any human-engineered turbine. This challenges unguided prebiotic assembly narratives and supports nuanced teleological biology.',
    tags: ['Biophysics', 'ATPSynthase', 'MolecularMotors', 'CellularDesign'],

    // Religious Reference Highlight Box
    religiousReference: {
      source: 'The Holy Qur\'an — Surah Al-Qamar (54:49) & Surah Al-Furqan (25:2)',
      scripture: 'Indeed, all things We created with predetermined measure (qadar). ... And He created each thing and determined it with precise determination (taqdīrā).',
      exegesis: 'The concept of "Taqdīr" encompasses mathematical precision, stoichiometric ratio, and physical fine-tuning inherent in the microscopic constituents of life.',
      tradition: 'Classical Teleological Discourse (Dalil al-Inayah)',
    },

    // Scientific Explanation Highlight Box
    scientificReference: {
      field: 'Structural Biophysics & Cryo-Electron Microscopy',
      citation: 'Science (2025) — DOI: 10.1126/science.ade4821',
      paperTitle: 'Atomic Resolution Structures of Mammalian ATP Synthase in Active Rotary States',
      explanation: 'Cryo-EM reconstructions at 1.9Å resolution demonstrate exact electrostatic torque generation in the c-ring subunit, confirming stoichiometric ATP synthesis per rotational revolution.',
    },

    // Multimedia: Single Image
    media: {
      type: 'image',
      items: [
        {
          url: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=1000&auto=format&fit=crop&q=80',
          caption: 'Cryo-EM Nanoscale Reconstruction of Rotary Membrane Molecular Motor (1.9Å resolution)',
          alt: 'Microscopic molecular structure',
        }
      ]
    },

    stats: {
      likes: 620,
      insightfuls: 489,
      commentsCount: 82,
      shares: 145,
    },
    comments: []
  },

  {
    id: 'post-5',
    category: 'History',
    author: {
      name: 'Dr. Zayd Al-Ghazali',
      handle: '@zayd_ghazali',
      roleBadge: 'Theologian & Science Historian',
      badgeType: 'theology',
      institution: 'Oxford & Al-Azhar University',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      isVerified: true,
    },
    timestamp: '1 day ago',
    title: 'Ibn al-Haytham’s Kitab al-Manazir: The Birth of the Controlled Experiment as an Act of Devotion',
    content: 'When Hasan Ibn al-Haytham (Alhazen) published his Book of Optics (1021 CE), he revolutionized epistemology by demanding controlled repeatable experimentation (I\'tibar) rather than relying on abstract Greek deduction. For Ibn al-Haytham, eradicating cognitive bias and pursuing physical reality through empirical verification was not distinct from faith; it was an act of intellectual piety honoring the Creator of truth (Al-Haqq).',
    tags: ['HistoryOfScience', 'IbnAlHaytham', 'Optics', 'ScientificMethod'],

    // Religious Reference Highlight Box
    religiousReference: {
      source: 'Ibn al-Haytham — Prologue to Kitab al-Manazir & Ash-Shukuk \'ala Batlamyus',
      scripture: '"The seeker after truth is not one who studies the writings of the ancients and puts his trust in them, but rather the one who suspects his faith in them and questions what he gathers from them... who submits only to argument and demonstrations."',
      exegesis: 'Alhazen grounds his methodological skepticism in the imperative to pursue absolute truth regardless of authority, reflecting Quranic warnings against blind adherence to ancestors (Taqlid).',
      tradition: 'Islamic Golden Age Epistemology',
    },

    // Scientific Explanation Highlight Box
    scientificReference: {
      field: 'Epistemology & History of the Scientific Method',
      citation: 'Nature Physics History of Science Series (2024)',
      paperTitle: 'From the Camera Obscura to Modern Quantum Optics: Alhazen\'s Legacy',
      explanation: 'Ray-tracing experiments conducted in darkened chambers (Al-Bayt al-Muthlim) definitively disproved Ptolemy and Euclid’s intromission theories and established optical empirical falsification.',
    },

    // Multimedia: PDF Document Preview
    media: {
      type: 'pdf',
      document: {
        title: 'Ibn_Al_Haytham_Optics_Manuscript_Translation.pdf',
        fileSize: '6.8 MB',
        pagesCount: 44,
        description: 'Complete annotated Latin and Arabic translation of Book of Optics Chapters 1-3 with geometric diagrams.',
        downloadUrl: '#',
      }
    },

    stats: {
      likes: 710,
      insightfuls: 530,
      commentsCount: 95,
      shares: 180,
    },
    comments: []
  }
];
