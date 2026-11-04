// Turns the session's overrides into the change a developer makes to
// app/design-system/tokens/tokens.source.json: a JSON Patch (RFC 6902) with a
// `test` of the current value before each `replace`, so applying it to a
// file that has moved on fails instead of overwriting.
//
// An edit changes `$value`, the value the code renders. A proposed
// back-office value (`$extensions.gv.backOffice`) is not touched.
import type { TokenMeta } from './data';
import { parseColour } from './overrides';

export type SourceChange = {
  token: string;
  pointer: string;
  from: unknown;
  to: string;
};

type Node = Record<string, unknown>;

const isNode = (v: unknown): v is Node =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

const nodeAt = (source: unknown, path: string): Node | undefined => {
  let node: unknown = source;
  for (const key of path.split('.')) {
    if (!isNode(node)) return undefined;
    node = node[key];
  }
  return isNode(node) ? node : undefined;
};

// JSON Pointer (RFC 6901) of a key list.
const pointer = (keys: string[]) =>
  '/' + keys.map((k) => k.replace(/~/g, '~0').replace(/\//g, '~1')).join('/');

// True when the `(` at index 3 of `s` closes at its last character.
const wholeCall = (s: string) => {
  let depth = 0;
  for (let i = 3; i < s.length; i++) {
    if (s[i] === '(') depth++;
    if (s[i] === ')' && --depth === 0) return i === s.length - 1;
  }
  return false;
};

// `var(--gv-x)` of a known token becomes the source alias `{path.of.x}`. A
// fallback, `var(--gv-x, 4px)`, is dropped: a known token is always defined.
const toSourceValue = (value: string, byName: Map<string, TokenMeta>) => {
  const v = value.trim();
  const ref = /^var\(\s*(--gv-[a-z0-9-]+)\s*(,|\))/.exec(v);
  const target = ref && wholeCall(v) ? byName.get(ref[1]) : undefined;
  return target?.path ? `{${target.path}}` : v;
};

// Channels 0-255 within half a step; alpha 0-1 within half an 8-bit step,
// so a translucent edit never aliases an opaque primitive.
const sameColour = (a: string, b: string) => {
  const x = parseColour(a);
  const y = parseColour(b);
  if (!x || !y) return false;
  const rgbSame = [0, 1, 2].every((i) => Math.abs(x[i] - y[i]) < 0.5);
  return rgbSame && Math.abs(x[3] - y[3]) <= 0.002;
};

// A colour edit of a semantic token that equals a tier-1 primitive (what
// the editor snaps to) is written as the alias of that primitive, so the
// token stays linked to the palette. Several primitives with the value: the
// scanner's tie-break, by name. A primitive keeps its own literal.
const primitiveAlias = (
  token: TokenMeta,
  value: string,
  meta: TokenMeta[]
): string | undefined => {
  if (token.category !== 'color' || token.tier === 1) return undefined;
  const hit = meta
    .filter(
      (t) =>
        t.tier === 1 &&
        t.category === 'color' &&
        t.path &&
        sameColour(t.value, value)
    )
    .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))[0];
  return hit ? `{${hit.path}}` : undefined;
};

export const sourceChanges = (
  overrides: Record<string, string | undefined>,
  meta: TokenMeta[],
  source: unknown
): { changes: SourceChange[]; unknown: string[] } => {
  const byName = new Map(meta.map((t) => [t.name, t]));
  const changes: SourceChange[] = [];
  const missing: string[] = [];
  for (const [name, value] of Object.entries(overrides)) {
    if (typeof value !== 'string') continue;
    const token = byName.get(name);
    const node = token?.path ? nodeAt(source, token.path) : undefined;
    if (!token?.path || !node) {
      missing.push(name);
      continue;
    }
    const keys = token.path.split('.');
    const raw = toSourceValue(value, byName);
    const to = primitiveAlias(token, raw, meta) ?? raw;
    if (node.$value !== to) {
      changes.push({
        token: name,
        pointer: pointer([...keys, '$value']),
        from: node.$value,
        to,
      });
    }
  }
  return { changes, unknown: missing };
};

// The patch as text, ready to paste.
export const sourcePatch = (changes: SourceChange[]): string =>
  JSON.stringify(
    changes.flatMap((c) => [
      { op: 'test', path: c.pointer, value: c.from },
      { op: 'replace', path: c.pointer, value: c.to },
    ]),
    null,
    2
  );
