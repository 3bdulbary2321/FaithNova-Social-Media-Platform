/**
 * Normalizes a post from the Laravel API into the shape expected by React components.
 */
export function normalizePost(post) {
  if (!post) return null;

  // Extract author info
  const authorData = post.author || {};
  const authorName = authorData.name || 'FaithNova Scholar';
  const authorHandle = authorData.username ? `@${authorData.username}` : (authorData.handle || '@scholar');
  const authorAvatar = authorData.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=250&auto=format&fit=crop&q=80';
  const authorRole = authorData.role || 'user';
  
  let roleBadge = authorData.roleBadge || 'Scholar Fellow';
  let badgeType = authorData.badgeType || 'science';
  if (authorRole === 'admin') {
    roleBadge = 'Curator';
    badgeType = 'theology';
  } else if (authorRole === 'moderator') {
    roleBadge = 'Senior Fellow';
    badgeType = 'theology';
  }

  // Extract category
  const categoryName = typeof post.category === 'object' && post.category !== null 
    ? (post.category.name || 'General')
    : (post.category || 'General');

  // Extract stats
  const statsData = post.stats || {};
  const likes = typeof statsData.likes === 'number' ? statsData.likes : (statsData.likes_count || 0);
  const insightfuls = typeof statsData.insightfuls === 'number' ? statsData.insightfuls : (statsData.insightfuls_count || 0);
  const commentsCount = typeof statsData.commentsCount === 'number' ? statsData.commentsCount : (statsData.comments_count || 0);

  // Parse religious reference
  let religiousReference = null;
  if (post.religiousReference) {
    religiousReference = post.religiousReference;
  } else if (post.religious_reference) {
    const text = post.religious_reference;
    religiousReference = {
      source: 'Scriptural Exegesis & Theological Source',
      scripture: text,
      exegesis: 'Classical hermeneutical synthesis.',
      tradition: 'Classical Exegesis',
    };
  }

  // Parse scientific reference
  let scientificReference = null;
  if (post.scientificReference) {
    scientificReference = post.scientificReference;
  } else if (post.scientific_reference) {
    const text = post.scientific_reference;
    scientificReference = {
      field: `${categoryName} & Empirical Sciences`,
      citation: text,
      paperTitle: 'Peer-Reviewed Empirical Correlation',
      explanation: text,
    };
  }

  // Normalize media
  let media = null;
  if (post.media) {
    if (Array.isArray(post.media)) {
      const images = post.media.filter(m => m.media_type === 'image');
      const videos = post.media.filter(m => m.media_type === 'video');
      const docs = post.media.filter(m => m.media_type === 'document');

      if (images.length > 0) {
        media = {
          type: 'image',
          items: images.map(img => ({
            url: img.file_path,
            caption: img.caption || post.title,
            alt: post.title,
          })),
        };
      } else if (videos.length > 0) {
        media = {
          type: 'video',
          video: {
            title: post.title,
            duration: '08:45',
            poster: videos[0].file_path,
            views: '1.4k views',
            speaker: authorName,
          },
        };
      } else if (docs.length > 0) {
        media = {
          type: 'pdf',
          document: {
            title: `${post.title.slice(0, 30)}.pdf`,
            fileSize: '2.4 MB',
            pagesCount: 12,
            description: 'Supplementary academic monograph & dataset attachment.',
            downloadUrl: docs[0].file_path,
          },
        };
      }
    } else {
      media = post.media;
    }
  }

  // Normalize comments
  const rawComments = post.comments || [];
  const normalizedComments = rawComments.map(c => normalizeComment(c));

  return {
    ...post,
    id: post.id,
    title: post.title || 'Untitled Academic Synthesis',
    content: post.content || '',
    category: categoryName,
    author: {
      id: authorData.id,
      name: authorName,
      handle: authorHandle,
      avatar: authorAvatar,
      role: authorRole,
      roleBadge,
      badgeType,
      isVerified: authorRole === 'admin' || authorRole === 'moderator' || Boolean(authorData.isVerified),
      institution: authorData.bio || 'FaithNova Academic Fellowship',
    },
    timestamp: post.created_at_human || post.timestamp || 'Recently',
    tags: post.tags || [categoryName, 'AcademicSynthesis', 'Harmony'],
    religiousReference,
    scientificReference,
    media,
    stats: {
      likes,
      insightfuls,
      commentsCount,
      shares: statsData.shares || 0,
    },
    user_reaction: post.user_reaction || null,
    comments: normalizedComments,
  };
}

/**
 * Normalizes comment objects recursively.
 */
export function normalizeComment(c) {
  if (!c) return null;

  const author = c.author || {};
  const authorName = typeof author === 'string' ? author : (author.name || 'Scholar Member');
  const authorAvatar = typeof author === 'object' ? (author.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=250&auto=format&fit=crop&q=80') : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=250&auto=format&fit=crop&q=80';

  const replies = (c.replies || c.children || []).map(r => normalizeComment(r));

  return {
    id: c.id,
    author: {
      id: typeof author === 'object' ? author.id : null,
      name: authorName,
      handle: typeof author === 'object' && author.username ? `@${author.username}` : '@scholar',
      avatar: authorAvatar,
      roleBadge: typeof author === 'object' && author.role === 'admin' ? 'Curator' : 'Fellow',
      badgeType: 'science',
      isVerified: true,
      institution: 'FaithNova Academic Circle',
    },
    timestamp: c.created_at_human || c.time || 'Recently',
    text: c.content || c.text || '',
    likes: c.likes || 0,
    isLiked: Boolean(c.isLiked),
    replies,
  };
}

/**
 * Normalizes user objects from Laravel API /auth/me, /auth/login, etc.
 */
export function normalizeUser(rawUser) {
  if (!rawUser) return null;
  const username = rawUser.username || rawUser.handle?.replace('@', '') || 'scholar';
  const roleName = rawUser.role === 'admin' 
    ? 'Curator & Administrator' 
    : (rawUser.role === 'moderator' ? 'Senior Fellow & Moderator' : 'Fellow Scholar');

  return {
    ...rawUser,
    id: rawUser.id,
    name: rawUser.name || 'FaithNova Scholar',
    username,
    handle: `@${username}`,
    title: rawUser.title || (rawUser.role === 'admin' ? 'Founding Curator' : 'Fellow Researcher'),
    institution: rawUser.institution || (rawUser.bio ? rawUser.bio.slice(0, 45) : 'FaithNova Academic Fellowship'),
    department: rawUser.department || 'Comparative Hermeneutics & Empirical Sciences',
    email: rawUser.email || '',
    avatar: rawUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=250&auto=format&fit=crop&q=80',
    coverBanner: rawUser.coverBanner || 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=1400&auto=format&fit=crop&q=80',
    bio: rawUser.bio || 'Interdisciplinary researcher investigating the intersections of sacred wisdom and empirical discoveries.',
    reputation: rawUser.reputation || (rawUser.reactions_count ? rawUser.reactions_count * 15 : 1200),
    peerReviews: rawUser.peerReviews || (rawUser.comments_count || 24),
    savedPostsCount: rawUser.savedPostsCount || 8,
    followingCount: rawUser.followingCount || 45,
    followersCount: rawUser.followersCount || 128,
    isVerified: rawUser.role === 'admin' || rawUser.role === 'moderator' || Boolean(rawUser.isVerified),
    role: rawUser.roleTitle || roleName,
    rawRole: rawUser.role || 'user',
    joinedDate: rawUser.created_at ? `Joined ${new Date(rawUser.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}` : (rawUser.joinedDate || 'Fellow since 2024'),
    location: rawUser.location || 'Oxford, United Kingdom',
    website: rawUser.website || 'https://faithnova.academia.edu',
    specialties: rawUser.specialties || ['Cosmology', 'Classical Hermeneutics', 'Epistemology'],
  };
}
