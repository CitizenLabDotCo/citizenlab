// What the scan says about each token: how often it is used, how far it
// reaches (components and routes), and which text and background colours
// the same component reads (the contrast pairs). Pure functions over the
// scan and the token metadata; the shell memoises their results once.
import type { Finding, ScanOutput, TokenMeta } from './data';
import { parseColour, SNAP_DELTA_E } from './overrides';

// Legacy name (as the scanner reports it) to the tokens that list it.
export const legacyIndex = (meta: TokenMeta[]): Map<string, string[]> => {
  const index = new Map<string, string[]>();
  for (const t of meta) {
    for (const name of t.legacy) {
      const list = index.get(name) ?? [];
      if (!list.includes(t.name)) list.push(t.name);
      index.set(name, list);
    }
  }
  return index;
};

// `props.theme.colors.x` and line-wrapped member reads become the name the
// metadata uses (`theme.colors.x`).
const legacyKey = (raw: string) =>
  raw.replace(/\s+/g, '').replace(/^props\./, '');

const isLegacy = (f: Finding) => f.category.startsWith('legacy-');

// The tokens a finding stands for. token-var: every known --gv- name it
// reads. legacy-*: the tokens that list the legacy name. With
// `suggestions`, also a literal colour's suggested token when it is within
// the snapping distance (the literal is that colour in all but name).
export const tokensOfFinding = (
  f: Finding,
  legacy: Map<string, string[]>,
  known: Set<string>,
  suggestions = false
): string[] => {
  if (f.category === 'token-var') {
    const names = f.raw.match(/--gv-[a-z0-9-]+/g) ?? [];
    return [...new Set(names)].filter((n) => known.has(n));
  }
  if (isLegacy(f)) return legacy.get(legacyKey(f.raw)) ?? [];
  if (
    suggestions &&
    (f.category === 'hex' ||
      f.category === 'rgba' ||
      f.category === 'named-color') &&
    f.suggestion &&
    f.suggestion.distance <= SNAP_DELTA_E &&
    known.has(f.suggestion.token)
  ) {
    return [f.suggestion.token];
  }
  return [];
};

// A component as the scan sees it: the named styled or local component in a
// file, or the file itself.
export const componentKey = (f: Finding) =>
  f.component ? `${f.file}#${f.component}` : f.file;

// Readable name of a component key: `Name (Folder/file.tsx)`.
export const componentLabel = (key: string) => {
  const [file, name] = key.split('#');
  const short = file.split('/').slice(-2).join('/');
  return name ? `${name} (${short})` : short;
};

export type TokenUsage = {
  // token-var reads plus legacy names that map to the token.
  count: number;
  components: number;
  routes: number;
};

const filesToRoutes = (scan: ScanOutput): Map<string, string[]> => {
  const byFile = new Map<string, string[]>();
  for (const [route, files] of Object.entries(scan.routeFiles ?? {})) {
    for (const file of files) {
      const list = byFile.get(file) ?? [];
      list.push(route);
      byFile.set(file, list);
    }
  }
  // Older scans without routeFiles: the component scores carry routes.
  if (byFile.size === 0) {
    for (const c of scan.components) byFile.set(c.file, c.routes);
  }
  return byFile;
};

export const buildUsage = (
  scan: ScanOutput,
  meta: TokenMeta[]
): Map<string, TokenUsage> => {
  const legacy = legacyIndex(meta);
  const known = new Set(meta.map((t) => t.name));
  const routesOf = filesToRoutes(scan);
  const acc = new Map<
    string,
    { count: number; components: Set<string>; routes: Set<string> }
  >();
  for (const f of scan.findings) {
    if (f.category !== 'token-var' && !isLegacy(f)) continue;
    const tokens = tokensOfFinding(f, legacy, known);
    if (tokens.length === 0) continue;
    const key = componentKey(f);
    const routes = routesOf.get(f.file) ?? [];
    for (const t of tokens) {
      let a = acc.get(t);
      if (!a) {
        a = { count: 0, components: new Set(), routes: new Set() };
        acc.set(t, a);
      }
      a.count++;
      a.components.add(key);
      for (const r of routes) a.routes.add(r);
    }
  }
  const out = new Map<string, TokenUsage>();
  for (const [t, a] of acc) {
    out.set(t, {
      count: a.count,
      components: a.components.size,
      routes: a.routes.size,
    });
  }
  return out;
};

// ---------------------------------------------------------------- pairs

export type ColourRole = 'text' | 'background';

const NOT_TEXT_OR_BACKGROUND =
  /border|divider|outline|halo|shadow|chart|grid|line|step|focus/;
const TEXT = /text|^on-|placeholder|heading|link|fg|label/;
const BACKGROUND =
  /background|bg|surface|canvas|fill|tint|light|tabstrip|row-alt|chip|lighten/;

// Whether a colour token is read as text or as a background, from its name
// and legacy names; a token with no hint (a primitive such as grey-800) is
// a background when light and text when dark. Borders, charts, focus and
// shadows are neither.
export const colourRole = (t: TokenMeta): ColourRole | null => {
  if (t.category !== 'color') return null;
  const name = t.name.replace(/^--gv-/, '');
  if (NOT_TEXT_OR_BACKGROUND.test(name)) return null;
  const words = [name, ...t.legacy.map((l) => l.split('.').pop() ?? '')]
    .join(' ')
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .toLowerCase();
  const text = TEXT.test(words);
  const background = BACKGROUND.test(words);
  if (text && !background) return 'text';
  if (background && !text) return 'background';
  if (TEXT.test(name)) return 'text';
  if (BACKGROUND.test(name)) return 'background';
  const rgba = parseColour(t.values.today);
  if (!rgba) return null;
  const [r, g, b] = rgba;
  // Perceived lightness: light primitives are surfaces, dark ones ink.
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 >= 0.6
    ? 'background'
    : 'text';
};

export type PairUse = {
  text: string;
  background: string;
  // Component keys that read both tokens.
  components: string[];
};

// For each component, every text colour token it reads against every
// background colour token it reads. Deduplicated by pair; the components
// that produce a pair are listed, most used pairs first. This is inferred
// from usage: the scan does not know which element sits on which.
export const buildPairs = (scan: ScanOutput, meta: TokenMeta[]): PairUse[] => {
  const legacy = legacyIndex(meta);
  const known = new Set(meta.map((t) => t.name));
  const roles = new Map<string, ColourRole>();
  for (const t of meta) {
    const role = colourRole(t);
    if (role) roles.set(t.name, role);
  }
  const byComponent = new Map<string, Set<string>>();
  for (const f of scan.findings) {
    for (const t of tokensOfFinding(f, legacy, known, true)) {
      if (!roles.has(t)) continue;
      const key = componentKey(f);
      const set = byComponent.get(key) ?? new Set<string>();
      set.add(t);
      byComponent.set(key, set);
    }
  }
  const pairs = new Map<string, PairUse>();
  for (const [key, tokens] of byComponent) {
    const list = [...tokens];
    const texts = list.filter((t) => roles.get(t) === 'text');
    const backgrounds = list.filter((t) => roles.get(t) === 'background');
    for (const text of texts) {
      for (const background of backgrounds) {
        const id = `${text}|${background}`;
        const pair = pairs.get(id) ?? { text, background, components: [] };
        pair.components.push(key);
        pairs.set(id, pair);
      }
    }
  }
  return [...pairs.values()]
    .map((p) => ({ ...p, components: p.components.sort() }))
    .sort(
      (a, b) =>
        b.components.length - a.components.length ||
        a.text.localeCompare(b.text) ||
        a.background.localeCompare(b.background)
    );
};
