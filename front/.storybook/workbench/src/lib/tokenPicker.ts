// The rows of the token picker: the tokens that fit a field, filtered by
// the typed query, in three groups. A token appears once, in the first
// group it belongs to.
import type { TokenMeta } from './data';
import { shortName } from './inspect';
import { parseColour } from './overrides';

export type PickerGroup = {
  id: 'match' | 'semantic' | 'scale';
  label: string;
  tokens: TokenMeta[];
};

const LABEL = {
  match: 'Matches',
  semantic: 'Semantic',
  scale: 'Scale',
} as const;

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
  // Live values of the mode, var() chains followed.
  resolved: Record<string, string>,
  // The rendered value of the field.
  raw: string,
  query: string
): PickerGroup[] => {
  const q = query.trim().toLowerCase();
  const all = meta
    .filter((t) => !t.deprecated && fits(t))
    .filter((t) => !q || shortName(t.name).toLowerCase().includes(q))
    .sort(bySemanticThenName);
  const value = (t: TokenMeta) => resolved[t.name] ?? t.values.today;
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
