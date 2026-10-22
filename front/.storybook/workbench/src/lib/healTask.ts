// The heal task the Tokens and Usage panels hand to Claude Code on the
// branch (SPEC 7.5): three lines, `heal:`, `why:` and `check:`.
//
//   heal: <Component> · <file>:<line> · <raw value> → <token> · mode <mode>
//   why: <category>, scan confidence <confidence>
//   check: story <story id>, routes <list>
import tokensMeta from '../../../../app/design-system/tokens/tokens.meta.json';

import type { Finding, TokenMeta } from './data';
import { legacyIndex, tokensOfFinding } from './usage';

export type HealMode = 'today' | 'redesign' | 'both';

// Routes named in the `check:` line; the rest are counted.
export const MAX_TASK_ROUTES = 8;

const META = tokensMeta as TokenMeta[];

const indexes = new WeakMap<
  TokenMeta[],
  { legacy: Map<string, string[]>; known: Set<string> }
>();
const indexOf = (meta: TokenMeta[]) => {
  let entry = indexes.get(meta);
  if (!entry) {
    entry = {
      legacy: legacyIndex(meta),
      known: new Set(meta.map((t) => t.name)),
    };
    indexes.set(meta, entry);
  }
  return entry;
};

// Findings a heal can fix: legacy reads and hard values (a call-site
// spacing value becomes a scale step on the layout primitive).
export const HEALABLE = new Set<Finding['category']>([
  'px',
  'layout-spacing',
  'hex',
  'rgba',
  'named-color',
  'legacy-theme',
  'legacy-colors',
  'legacy-bo',
]);

export const isHealable = (f: Finding) => HEALABLE.has(f.category);

// The token(s) a finding should become: the token a legacy name maps to,
// else the scanner's nearest token.
export const healToken = (f: Finding, meta: TokenMeta[] = META): string[] => {
  const { legacy, known } = indexOf(meta);
  if (f.category.startsWith('legacy-')) {
    return tokensOfFinding(f, legacy, known);
  }
  return f.suggestion && known.has(f.suggestion.token)
    ? [f.suggestion.token]
    : [];
};

// A route as a path (`admin` -> `/admin`, the home page `` -> `/`).
export const routeLabel = (path: string) => `/${path}`;

// A value the code wraps over lines reads as one (`props.theme\n.colors`).
const flat = (s: string) =>
  s
    .replace(/\s*\n\s*/g, '')
    .replace(/\s+/g, ' ')
    .trim();

export const formatHealTask = (
  f: Finding,
  component: string,
  storyId: string,
  routes: string[],
  mode: HealMode,
  meta: TokenMeta[] = META
): string => {
  const tokens = healToken(f, meta);
  const to = tokens.length ? tokens.join(' or ') : '(choose a token)';
  const named = routes.slice(0, MAX_TASK_ROUTES).map(routeLabel).join(', ');
  const rest = routes.length - MAX_TASK_ROUTES;
  const list =
    routes.length === 0
      ? 'none'
      : rest > 0
      ? `${named} and ${rest} more`
      : named;
  return [
    `heal: ${component} · ${f.file}:${f.line} · ${flat(
      f.raw
    )} → ${to} · mode ${mode}`,
    `why: ${f.category}, scan confidence ${f.confidence}`,
    `check: story ${storyId}, routes ${list}`,
  ].join('\n');
};
