import type { Section } from './stories';

const splitHash = (hash: string) => {
  const raw = hash.replace(/^#/, '');
  const q = raw.indexOf('?');
  return {
    path: q === -1 ? raw : raw.slice(0, q),
    params: new URLSearchParams(q === -1 ? '' : raw.slice(q + 1)),
  };
};

const joinHash = (path: string, params: URLSearchParams) => {
  const q = params.toString();
  return `#${path}${q ? `?${q}` : ''}`;
};

export const paramOf = (hash: string, name: string): string | null =>
  splitHash(hash).params.get(name);

// The hash of a story page with the given parameters. No share link
// (`o`): a pushed entry that carried one would bring that older value
// back on Back; the hooks write the session's current one in
// (lib/shareEntry.ts).
export const storyHash = (
  section: Section,
  storyId: string,
  set: Record<string, string | null> = {}
): string => {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(set)) if (v !== null) params.set(k, v);
  return joinHash(`/${section}/${encodeURIComponent(storyId)}`, params);
};
