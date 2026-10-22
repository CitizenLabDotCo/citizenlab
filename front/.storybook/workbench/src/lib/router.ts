import { useEffect, useState } from 'react';

// Hash routes of the shell. `#/start` is the default.
export type Route =
  | { name: 'start' }
  | { name: 'foundations'; category?: string }
  | { name: 'components'; storyId?: string }
  | { name: 'patterns'; storyId?: string }
  | { name: 'pages'; storyId?: string }
  | { name: 'review' }
  | { name: 'proposal' }
  | { name: 'not-found'; path: string };

// A `?` part (the share link's token overrides) is not part of the route.
export const parseHash = (hash: string): Route => {
  const path =
    hash.replace(/^#/, '').split('?')[0].replace(/\/+$/, '') || '/start';
  const [, first, second, ...rest] = path.split('/');
  if (rest.length > 0) return { name: 'not-found', path };
  const param = second ? decodeURIComponent(second) : undefined;
  switch (first) {
    case 'start':
      return param ? { name: 'not-found', path } : { name: 'start' };
    case 'foundations':
      return { name: 'foundations', category: param };
    case 'components':
    case 'patterns':
    case 'pages':
      return { name: first, storyId: param };
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
