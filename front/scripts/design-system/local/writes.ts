// What a Tier 1 edit does to the source, as pure text changes, so the
// local server only reads, calls these and writes:
//
// - a token value: a JSON Patch on tokens.source.json (a `test` of the
//   current value before each `replace`, the workbench's own format);
// - a component's own style value: the hard value or legacy read the scan
//   found at file:line:col becomes the token (`t.space[3]`), the way a heal
//   commit writes it, with the `t` import added when the file has none.
//
// Anything these cannot write safely comes back as an error that says to
// hand the change to the agent.

export type PatchOp =
  | { op: 'test'; path: string; value: unknown }
  | { op: 'replace'; path: string; value: unknown };

type Json = unknown;

const isNode = (v: Json): v is Record<string, Json> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

const keysOf = (pointer: string) => {
  if (!pointer.startsWith('/')) throw new Error(`Bad pointer ${pointer}`);
  return pointer
    .slice(1)
    .split('/')
    .map((k) => k.replace(/~1/g, '/').replace(/~0/g, '~'));
};

const same = (a: Json, b: Json) => JSON.stringify(a) === JSON.stringify(b);

export const isPatch = (v: unknown): v is PatchOp[] =>
  Array.isArray(v) &&
  v.length > 0 &&
  v.every(
    (o) =>
      isNode(o) &&
      (o.op === 'test' || o.op === 'replace') &&
      typeof o.path === 'string' &&
      o.path.startsWith('/') &&
      'value' in o
  );

// The source with the patch applied, formatted the way the file is kept.
// Only existing values are replaced: a pointer to nothing is an error, so
// a typo never adds a token.
export const applyTokenPatch = (text: string, ops: PatchOp[]): string => {
  const doc: Json = JSON.parse(text);
  for (const o of ops) {
    const keys = keysOf(o.path);
    const last = keys.pop()!;
    let node: Json = doc;
    for (const k of keys) {
      if (!isNode(node) || !(k in node)) throw new Error(`No ${o.path}`);
      node = node[k];
    }
    if (!isNode(node) || !(last in node)) throw new Error(`No ${o.path}`);
    if (o.op === 'test' && !same(node[last], o.value)) {
      throw new Error(
        `${o.path} is ${JSON.stringify(node[last])} now, not ${JSON.stringify(
          o.value
        )}: the source moved on.`
      );
    }
    if (o.op === 'replace') {
      if (typeof o.value !== 'string' && typeof o.value !== 'number') {
        throw new Error(`${o.path}: a token value is a string or a number`);
      }
      node[last] = o.value;
    }
  }
  return `${JSON.stringify(doc, null, 2)}\n`;
};

// The patch that takes the source back: each replace's test and value
// swapped.
export const inversePatch = (ops: PatchOp[]): PatchOp[] => {
  const tested = new Map(
    ops.filter((o) => o.op === 'test').map((o) => [o.path, o.value])
  );
  return ops.flatMap((o): PatchOp[] =>
    o.op === 'replace' && tested.has(o.path)
      ? [
          { op: 'test', path: o.path, value: o.value },
          { op: 'replace', path: o.path, value: tested.get(o.path) },
        ]
      : []
  );
};

// ---------------------------------------------------------------------------
// Component style

// `t` from tokens.ts as token name -> accessor: `--gv-space-3` ->
// `t.space[3]`, `--gv-background` -> `t.color.background`.
export const accessors = (t: Record<string, Record<string, string>>) => {
  const out = new Map<string, string>();
  for (const [category, entries] of Object.entries(t)) {
    for (const [key, value] of Object.entries(entries)) {
      const name = /^var\((--gv-[a-z0-9-]+)\)$/.exec(value)?.[1];
      if (!name) continue;
      const step = /^[A-Za-z_$][\w$]*$/.test(key)
        ? `.${key}`
        : /^(0|[1-9][0-9]*)$/.test(key)
        ? `[${key}]`
        : `['${key}']`;
      out.set(name, `t.${category}${step}`);
    }
  }
  return out;
};

export const T_IMPORT = "import { t } from 'design-system/tokens/tokens';";
export const CSS_IMPORT = "import 'design-system/tokens/tokens.css';";

// A binding of `t` other than the tokens import would be shadowed or
// clash; such a file goes to the agent.
const bindsT = (text: string) =>
  text
    .split('\n')
    .filter((l) => !/^\s*import\b/.test(l))
    .some((l) =>
      /\b(?:const|let|var|function|class)\s+t\b|[({,]\s*t\s*(?:[,)}=]|=>)|\bt\s*=>|\{\s*t\s*:/.test(
        l
      )
    );

const IMPORT_FROM =
  /^import\s+(?:type\s+)?\{([^}]*)\}\s+from\s+'design-system\/tokens\/tokens';$/m;

// `import { t } ...` in the file: kept when there, merged into an import
// of the same module, else a new line after the last import.
export const ensureTImport = (text: string): string => {
  const hit = IMPORT_FROM.exec(text);
  if (hit) {
    const names = hit[1]
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    if (names.includes('t')) return text;
    if (/^import\s+type/.test(hit[0])) return insertImport(text, T_IMPORT);
    const merged = `import { ${[...names, 't']
      .sort()
      .join(', ')} } from 'design-system/tokens/tokens';`;
    return text.replace(hit[0], merged);
  }
  return insertImport(text, T_IMPORT);
};

// After the last top-level import statement (single or multi line).
export const insertImport = (text: string, line: string): string => {
  if (text.includes(line)) return text;
  const lines = text.split('\n');
  let end = -1;
  for (let i = 0; i < lines.length; i++) {
    if (/^import\b/.test(lines[i])) {
      let j = i;
      while (j < lines.length && !/;\s*$/.test(lines[j])) j++;
      end = j;
      i = j;
    } else if (end >= 0 && lines[i].trim() && !lines[i].startsWith('//')) {
      break;
    }
  }
  lines.splice(end + 1, 0, line);
  return lines.join('\n');
};

export type StyleTarget = {
  line: number; // 1-based
  col: number; // 1-based
  raw: string;
  category: string;
};

export type StyleWrite =
  | { ok: true; text: string; from: string; to: string; line: number }
  | { ok: false; error: string };

const AGENT = 'hand this one to the agent';

const offsetOf = (text: string, line: number, col: number) => {
  const lines = text.split('\n');
  if (line < 1 || line > lines.length) return -1;
  let off = 0;
  for (let i = 0; i < line - 1; i++) off += lines[i].length + 1;
  return off + col - 1;
};

// The scan's place, or the same raw value nearby: an import added above
// moves a line down, an earlier write on the line moves the column.
const locate = (text: string, target: StyleTarget) => {
  const at = offsetOf(text, target.line, target.col);
  if (at >= 0 && text.startsWith(target.raw, at)) return at;
  const lines = text.split('\n');
  const hits: number[] = [];
  for (let l = target.line; l <= target.line + 3 && l <= lines.length; l++) {
    let from = 0;
    for (;;) {
      const i = lines[l - 1].indexOf(target.raw, from);
      if (i < 0) break;
      hits.push(offsetOf(text, l, i + 1));
      from = i + 1;
    }
  }
  return hits.length === 1 ? hits[0] : -1;
};

const backticksBefore = (text: string, at: number) => {
  let n = 0;
  for (let i = 0; i < at; i++) {
    if (text[i] === '`' && text[i - 1] !== '\\') n++;
  }
  return n;
};

const lineOf = (text: string, at: number) =>
  text.slice(0, at).split('\n').length;

// The value at the target becomes `to`: a token accessor (`t.space[3]`)
// or, with `literal`, a plain CSS value.
export const writeStyle = (
  text: string,
  target: StyleTarget,
  to: string,
  literal = false
): StyleWrite => {
  const at = locate(text, target);
  if (at < 0) {
    return {
      ok: false,
      error: `${target.raw} is no longer at line ${target.line}; run the scan again or ${AGENT}.`,
    };
  }
  const end = at + target.raw.length;
  const before = text[at - 1];
  const after = text[end];
  let from: string;
  let replacement: string;
  let start = at;
  let stop = end;

  if ((before === '"' || before === "'") && after === before) {
    // A whole string: a JSX attribute takes `{...}`, anything else the
    // bare expression.
    start = at - 1;
    stop = end + 1;
    from = text.slice(start, stop);
    const jsxAttr = /=\s*$/.test(text.slice(0, start));
    if (literal) replacement = `${before}${to}${before}`;
    else replacement = jsxAttr ? `{${to}}` : to;
  } else if (
    before === '"' ||
    before === "'" ||
    after === '"' ||
    after === "'"
  ) {
    return {
      ok: false,
      error: `${target.raw} is part of a longer value; ${AGENT}.`,
    };
  } else if (target.category.startsWith('legacy-')) {
    // A legacy read is an expression already.
    from = target.raw;
    if (literal) {
      return {
        ok: false,
        error: `A legacy read takes a token, not a value; ${AGENT}.`,
      };
    }
    replacement = to;
  } else if (backticksBefore(text, at) % 2 === 1) {
    // Inside a styled template: a token goes in as `${...}`.
    from = target.raw;
    replacement = literal ? to : `\${${to}}`;
  } else {
    return {
      ok: false,
      error: `Cannot tell how ${target.raw} is written here; ${AGENT}.`,
    };
  }

  let out = text.slice(0, start) + replacement + text.slice(stop);
  if (!literal) {
    if (bindsT(text)) {
      return {
        ok: false,
        error: `This file already uses the name t; ${AGENT}.`,
      };
    }
    out = ensureTImport(out);
  }
  return { ok: true, text: out, from, to: replacement, line: lineOf(text, at) };
};

// The tokens stylesheet in the app root, so tokens the platform reads are
// defined. One line, once.
export const ensureCssImport = (text: string) => insertImport(text, CSS_IMPORT);
