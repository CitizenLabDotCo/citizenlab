// The rows of the token picker: the tokens that fit a field. With nothing
// typed, three groups; a token appears once, in the first group it belongs
// to. With a query, one list, the closest match on top.
import type { TokenMeta } from './data';
import { shortName } from './inspect';
import { parseColour } from './overrides';

export type PickerGroup = {
  id: 'match' | 'semantic' | 'scale' | 'results';
  label: string;
  tokens: TokenMeta[];
};

// Nearest tokens: those whose value equals the field's. Inside the picker
// only; a value is never bound to one because it is equal.
const LABEL = {
  match: 'Nearest tokens',
  semantic: 'Semantic',
  scale: 'Scale',
  results: 'Results',
} as const;

// What a person types for a token: `--gv-text-secondary`, `var(--gv-text-`,
// `text secondary` and `textSecondary` all read as the words text,
// secondary. A bare `--gv` reads as nothing typed.
export const queryWords = (query: string) =>
  query
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .toLowerCase()
    .replace(/var\(|\)/g, ' ')
    .trim()
    .replace(/^-*(gv\b)?-*/, '')
    .split(/[^a-z0-9#.%]+/)
    .filter(Boolean);

const compact = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

// The letters of `q` in order inside `s` (fzf's fuzzy match).
const inOrder = (q: string, s: string) => {
  let i = 0;
  for (const c of s) if (c === q[i]) i++;
  return i === q.length;
};

// At most one letter added, left out or changed.
const oneEdit = (a: string, b: string) => {
  if (Math.abs(a.length - b.length) > 1) return false;
  let i = 0;
  while (i < a.length && a[i] === b[i]) i++;
  const tail = (x: number, y: number) => a.slice(i + x) === b.slice(i + y);
  return tail(1, 1) || tail(1, 0) || tail(0, 1);
};

// How well a token answers the query, 0 for not at all: its name exactly,
// then by its start, every word starting one of its words, anywhere in
// it, then by its value or legacy name, a typo, letters in order.
export const searchScore = (t: TokenMeta, words: string[], value: string) => {
  const name = shortName(t.name).toLowerCase();
  const own = name.split('-');
  const q = words.join('-');
  if (name === q) return 100;
  if (name.startsWith(q)) return 90;
  if (words.every((w) => own.some((o) => o.startsWith(w)))) return 70;
  if (name.includes(q)) return 60;
  const flat = compact(q);
  if (flat && compact(value).includes(flat)) return 50;
  if (flat && (t.legacy ?? []).some((l) => compact(l).includes(flat))) {
    return 45;
  }
  if (
    words.every(
      (w) => w.length >= 4 && own.some((o) => o.length >= 4 && oneEdit(w, o))
    )
  ) {
    return 30;
  }
  if (flat.length >= 3 && inOrder(flat, compact(name))) return 20;
  return 0;
};

// Semantic names first: they are what components should read.
const bySemanticThenName = (a: TokenMeta, b: TokenMeta) =>
  b.tier - a.tier || a.name.localeCompare(b.name);

// Equal as the browser draws them: colours by channel (rgb() against hex),
// anything else as text.
export const sameValue = (a: string, b: string) => {
  const x = a.trim().toLowerCase();
  const y = b.trim().toLowerCase();
  if (x === y) return true;
  const ca = parseColour(x);
  const cb = parseColour(y);
  return !!ca && !!cb && ca.every((c, i) => Math.abs(c - cb[i]) < 1e-3);
};

export const pickerGroups = (
  meta: TokenMeta[],
  fits: (t: TokenMeta) => boolean,
  // Live values, var() chains followed.
  resolved: Record<string, string>,
  // The rendered value of the field.
  raw: string,
  query: string
): PickerGroup[] => {
  const value = (t: TokenMeta) => resolved[t.name] ?? t.value;
  const fit = meta.filter((t) => !t.deprecated && fits(t));
  const words = queryWords(query);
  if (words.length) {
    const ranked = fit
      .map((t) => ({ t, score: searchScore(t, words, value(t)) }))
      .filter((r) => r.score > 0)
      .sort(
        (a, b) =>
          b.score - a.score ||
          b.t.tier - a.t.tier ||
          a.t.name.length - b.t.name.length ||
          a.t.name.localeCompare(b.t.name)
      )
      .map((r) => r.t);
    return ranked.length
      ? [{ id: 'results', label: LABEL.results, tokens: ranked }]
      : [];
  }
  const all = fit.sort(bySemanticThenName);
  const match = raw.trim() ? all.filter((t) => sameValue(value(t), raw)) : [];
  const rest = all.filter((t) => !match.includes(t));
  const groups: PickerGroup[] = [
    { id: 'match', label: LABEL.match, tokens: match },
    {
      id: 'semantic',
      label: LABEL.semantic,
      tokens: rest.filter((t) => t.tier === 2),
    },
    {
      id: 'scale',
      label: LABEL.scale,
      tokens: rest.filter((t) => t.tier === 1),
    },
  ];
  return groups.filter((g) => g.tokens.length > 0);
};
