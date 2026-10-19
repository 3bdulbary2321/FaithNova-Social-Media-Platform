import { useAuth } from '../context/AuthContext';

export default function CategoryPills({ selectedCategory, onSelectCategory }) {
  const { categories, posts } = useAuth();
  const names = [...new Set([...categories.map(c => c.name), ...posts.map(p => p.category)])];
  return <div className="category-pills" role="group" aria-label="Filter by discipline">{['All', ...names].map(name => <button key={name} className={selectedCategory === name ? 'selected' : ''} aria-pressed={selectedCategory === name} onClick={() => onSelectCategory(name)}>{name === 'All' ? 'All disciplines' : name}</button>)}</div>;
}
