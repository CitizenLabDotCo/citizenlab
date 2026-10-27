import { useEffect, useState } from 'react';

// Hash routes of the shell. `#/components` is the default.
export type Route =
  | { name: 'foundations'; category?: string; token?: string }
  | { name: 'components'; storyId?: string }
  | { name: 'review' }
  | { name: 'not-found'; path: string };

export const DEFAULT_HASH = '#/components';

// Paths that open another page: the empty hash and the old `#/start` open
// Components, and Foundations, which has no overview, opens Colour.
const REDIRECTS: Record<string, string> = {
  '': DEFAULT_HASH,
  '/start': DEFAULT_HASH,
  '/foundations': '#/foundations/color',
};

// The hash to replace this one with, keeping its `?` part (the share link's
// token overrides), or null when it needs none.
export const redirectOf = (hash: string): string | null => {
  const raw = hash.replace(/^#/, '');
  const q = raw.indexOf('?');
  const path = (q === -1 ? raw : raw.slice(0, q)).replace(/\/+$/, '');
  const to = REDIRECTS[path];
  return to === undefined ? null : to + (q === -1 ? '' : raw.slice(q));
};

// A `?` part is not part of the route.
export const parseHash = (hash: string): Route => {
  const to = redirectOf(hash);
  if (to !== null) return parseHash(to);
  const path = hash.replace(/^#/, '').split('?')[0].replace(/\/+$/, '');
  const [, first, second, ...rest] = path.split('/');
  // Foundations takes a third segment: the token row to show.
  if (rest.length > 1 || (rest.length === 1 && first !== 'foundations')) {
    return { name: 'not-found', path };
  }
  const param = second ? decodeURIComponent(second) : undefined;
  switch (first) {
    case 'foundations':
      return rest.length
        ? {
            name: 'foundations',
            category: param,
            token: decodeURIComponent(rest[0]),
          }
        : { name: 'foundations', category: param };
    // Patterns and Pages were sections of their own: their stories are in
    // Components now, so their links still open.
    case 'components':
    case 'patterns':
    case 'pages':
      return { name: 'components', storyId: param };
    case 'review':
      return param ? { name: 'not-found', path } : { name: 'review' };
    default:
      return { name: 'not-found', path };
  }
};

// The route of the current hash. A redirect replaces the history entry, so
// Back does not land on it again.
const readRoute = (): Route => {
  const to = redirectOf(window.location.hash);
  if (to !== null) window.history.replaceState(null, '', to);
  return parseHash(window.location.hash);
};

export const useRoute = (): Route => {
  const [route, setRoute] = useState(readRoute);
  useEffect(() => {
    const onChange = () => setRoute(readRoute());
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return route;
};

// The whole hash, `?` part included, as it changes. A replaceState (the
// share link, a return's selection) does not fire hashchange and is not
// seen until the next one.
export const useHash = (): string => {
  const [hash, setHash] = useState(() => window.location.hash);
  useEffect(() => {
    const onChange = () => setHash(window.location.hash);
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return hash;
};
