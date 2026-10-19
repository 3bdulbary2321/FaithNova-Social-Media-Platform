import { useState } from 'react';

export default function Avatar({ src, name = '', className = 'avatar' }) {
  const [failedSource, setFailedSource] = useState(null);
  if (!src || failedSource === src) return <span className={`${className} avatar-fallback`} role="img" aria-label={name || 'Community member'}>{name.split(/\s+/).filter(Boolean).slice(-2).map(part => part[0]).join('').toUpperCase() || 'FN'}</span>;
  return <img className={className} src={src} alt={name} loading="lazy" onError={() => setFailedSource(src)} />;
}
