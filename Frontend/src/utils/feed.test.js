import test from 'node:test';
import assert from 'node:assert/strict';
import { filterFeed } from './feed.js';

const posts = [
  { id: 1, title: 'The expanding universe', content: 'A discussion of cosmic origins', category: 'Astronomy', author: { name: 'Amina' }, tags: ['Cosmology'], timestamp: '1 day ago', stats: { likes: 20, insightfuls: 3 } },
  { id: 2, title: 'Quantum questions', content: 'Exploring matter', category: 'Physics', author: { name: 'Tariq' }, tags: ['Quantum'], timestamp: '2 hours ago', scientificReference: { citation: 'DOI: 10.1000/example' }, stats: { likes: 5, insightfuls: 10 } },
  { id: 3, title: 'A new discovery', content: 'Looking at the stars', category: 'Astronomy', author: { name: 'Sarah' }, tags: [], timestamp: 'Just now', stats: { likes: 0, insightfuls: 0 } },
];
const ids = result => result.map(post => post.id);

test('matches topic route aliases to API discipline names', () => {
  assert.deepEqual(ids(filterFeed(posts, { topic: 'quantum-physics' })), [2]);
  assert.deepEqual(ids(filterFeed(posts, { topic: 'astronomy-cosmology' })), [3, 1]);
  assert.deepEqual(filterFeed(posts, { topic: 'sacred-hermeneutics' }), []);
});
test('searches titles, authors, tags, and references without case sensitivity', () => {
  for (const query of ['quantum', ' TARIQ ', '10.1000/example']) assert.deepEqual(ids(filterFeed(posts, { query })), [2]);
  assert.deepEqual(ids(filterFeed(posts, { query: 'cosmology' })), [1]);
});
test('combines saved, search, and category filters', () => {
  assert.deepEqual(ids(filterFeed(posts, { savedIds: ['1', '2'], category: 'Astronomy', query: 'cosmic' })), [1]);
  assert.deepEqual(filterFeed(posts, { savedIds: [] }), []);
  assert.deepEqual(filterFeed(posts, { category: 'Biology' }), []);
});
test('sorts by recency, insightful reactions, and likes', () => {
  assert.deepEqual(ids(filterFeed(posts)), [3, 2, 1]);
  assert.deepEqual(ids(filterFeed(posts, { sort: 'insightful' })), [2, 1, 3]);
  assert.deepEqual(ids(filterFeed(posts, { sort: 'popular' })), [1, 2, 3]);
  assert.deepEqual(ids(posts), [1, 2, 3], 'Source data is not mutated');
});
test('uses API creation dates for chronological sorting', () => {
  assert.deepEqual(ids(filterFeed([{ ...posts[0], created_at: '2026-10-01T10:00:00Z' }, { ...posts[1], created_at: '2026-10-02T10:00:00Z' } ])), [2, 1]);
});
