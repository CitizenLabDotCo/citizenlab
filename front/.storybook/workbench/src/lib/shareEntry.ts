// The share links in the hash (`o` token edits, `p` instance prop edits)
// and the browser history. A hook writes the session's value into the
// entry it is on with replaceState and marks the entry's state with that
// value. Back to an older entry then brings a value equal to its mark: the
// session's own, older, not a link someone pasted; the hook writes the
// current value back instead of applying it. A pasted link is a new entry
// with no mark, so it applies. Pure, but for `writeShare`.

const KEY = 'wbShare';

type Marks = Record<string, string | null>;

const marksOf = (state: unknown): Marks | undefined => {
  if (!state || typeof state !== 'object') return undefined;
  const marks = (state as Record<string, unknown>)[KEY];
  return marks && typeof marks === 'object' ? (marks as Marks) : undefined;
};

// The history state with `param`'s value marked as the session's own.
export const markShare = (
  state: unknown,
  param: string,
  value: string | null
): Record<string, unknown> => {
  const base =
    state && typeof state === 'object'
      ? (state as Record<string, unknown>)
      : {};
  return { ...base, [KEY]: { ...marksOf(state), [param]: value } };
};

// Whether the entry's `param` value is one the session wrote there.
export const isOwnShare = (
  state: unknown,
  param: string,
  value: string | null
): boolean => {
  const marks = marksOf(state);
  return !!marks && param in marks && marks[param] === value;
};

export const valueIn = (hash: string, param: string) => {
  const q = hash.indexOf('?');
  return q === -1
    ? null
    : new URLSearchParams(hash.slice(q + 1)).get(param) || null;
};

// Puts `hash` (the session's value of `param` in it) on the current entry
// and marks it.
export const writeShare = (param: string, hash: string) => {
  window.history.replaceState(
    markShare(window.history.state, param, valueIn(hash, param)),
    '',
    hash === window.location.hash ? undefined : hash || '#'
  );
};
