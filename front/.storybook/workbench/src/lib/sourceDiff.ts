// Turns the session's overrides into the change a developer makes to
// app/design-system/tokens/tokens.source.json: a JSON Patch (RFC 6902) with a
// `test` of the current value before each `replace`, so applying it to a
// file that has moved on fails instead of overwriting.
//
// An override sits on the page root, so it holds in both modes. In the
// source, `$value` is today and `$extensions.gv.redesign` (when present) the
// redesign value; a token without its own redesign value takes `$value` in
// both modes, so one change covers both.
import type { TokenMeta } from './data';

export type SourceChange = {
  token: string;
  // Which modes this source field drives.
  modes: 'both' | 'today' | 'redesign';
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

// `var(--gv-x)` of a known token becomes the source alias `{path.of.x}`.
const toSourceValue = (value: string, byName: Map<string, TokenMeta>) => {
  const ref = /^var\(\s*(--gv-[a-z0-9-]+)\s*\)$/.exec(value.trim());
  const target = ref ? byName.get(ref[1]) : undefined;
  return target?.path ? `{${target.path}}` : value.trim();
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
    const to = toSourceValue(value, byName);
    const gv = isNode(node.$extensions) ? node.$extensions.gv : undefined;
    const hasRedesign = isNode(gv) && 'redesign' in gv;
    if (node.$value !== to) {
      changes.push({
        token: name,
        modes: hasRedesign ? 'today' : 'both',
        pointer: pointer([...keys, '$value']),
        from: node.$value,
        to,
      });
    }
    if (hasRedesign && gv.redesign !== to) {
      changes.push({
        token: name,
        modes: 'redesign',
        pointer: pointer([...keys, '$extensions', 'gv', 'redesign']),
        from: gv.redesign,
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
