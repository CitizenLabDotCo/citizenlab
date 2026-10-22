import { useEffect, useState } from 'react';

// Hash routes of the shell. `#/start` is the default.
export type Route =
  | { name: 'start' }
  | { name: 'foundations'; category?: string }
  | { name: 'components'; storyId?: string }
  | { name: 'patterns' }
  | { name: 'pages' }
  | { name: 'review' }
  | { name: 'proposal' }
  | { name: 'not-found'; path: string };

export const parseHash = (hash: string): Route => {
  const path = hash.replace(/^#/, '').replace(/\/+$/, '') || '/start';
  const [, first, second, ...rest] = path.split('/');
  if (rest.length > 0) return { name: 'not-found', path };
  const param = second ? decodeURIComponent(second) : undefined;
  switch (first) {
    case 'start':
      return param ? { name: 'not-found', path } : { name: 'start' };
    case 'foundations':
      return { name: 'foundations', category: param };
    case 'components':
      return { name: 'components', storyId: param };
    case 'patterns':
    case 'pages':
    case 'review':
    case 'proposal':
      return param ? { name: 'not-found', path } : { name: first };
    default:
      return { name: 'not-found', path };
  }
};

export const useRoute = (): Route => {
  const [route, setRoute] = useState(() => parseHash(window.location.hash));
  useEffect(() => {
    const onChange = () => setRoute(parseHash(window.location.hash));
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return route;
};
