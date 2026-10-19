// Route slugs and API category names describe the same disciplines differently.
const TOPIC_CATEGORIES = {
  'astronomy-cosmology': ['astronomy', 'cosmology', 'astronomy & cosmology'],
  'quantum-physics': ['physics', 'quantum physics'],
  'biology-evolution': ['biology', 'biology & evolution'],
  'medicine-embryology': ['medicine', 'medicine & embryology'],
  'neurotheology-mind': ['neurotheology', 'neuroscience', 'neurotheology & mind'],
  'philosophy-kalam': ['philosophy', 'philosophy & kalam'],
  'sacred-hermeneutics': ['sacred hermeneutics', 'sacred texts', 'hermeneutics'],
};

function postTime(post) {
  const absolute = Date.parse(post.created_at || '');
  if (Number.isFinite(absolute)) return absolute;
  const relative = (post.timestamp || '').toLowerCase();
  if (/just now|recently/.test(relative)) return Date.now();
  const match = relative.match(/(\d+)\s*(minute|min|hour|hr|day|week|month|year|m\b|h\b|d\b)/);
  if (!match) return 0;
  const unit = match[2];
  const multiplier = unit.startsWith('year') ? 525600 : unit.startsWith('month') ? 43200 : unit.startsWith('week') ? 10080 : unit.startsWith('d') ? 1440 : unit.startsWith('h') ? 60 : 1;
  return Date.now() - Number(match[1]) * multiplier * 60000;
}

export function filterFeed(posts, { category = 'All', query = '', sort = 'latest', topic, savedIds = null } = {}) {
  const q = query.trim().toLowerCase();
  return posts.filter(post => {
    const name = post.category.toLowerCase();
    if (savedIds && !savedIds.some(id => String(id) === String(post.id))) return false;
    if (category !== 'All' && name !== category.toLowerCase()) return false;
    if (topic && !(TOPIC_CATEGORIES[topic] || [topic.replaceAll('-', ' ')]).includes(name)) return false;
    const text = [post.title, post.content, post.author.name, ...post.tags, post.religiousReference?.source, post.scientificReference?.citation].filter(Boolean).join(' ').toLowerCase();
    return !q || text.includes(q);
  }).sort((a, b) => sort === 'insightful' ? b.stats.insightfuls - a.stats.insightfuls : sort === 'popular' ? b.stats.likes - a.stats.likes : postTime(b) - postTime(a));
}
