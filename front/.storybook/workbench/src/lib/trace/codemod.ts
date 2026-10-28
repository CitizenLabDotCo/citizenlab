// An edit of the code is a codemod of the traced expression: the range the
// trace names (`editable`) becomes the token's var(), on its one line, and
// nothing else in the file changes. Both texts are parsed with Babel and
// their token streams compared; anything that is not exactly the
// replacement is left to a person, with the reason.
import type { TokenName } from '@ds/tokens/tokens';

// What an ElementEdit keeps of its trace: where the expression is, as the
// index's commit had it.
export type EditTrace = {
  commit: string;
  // From front/.
  file: string;
  line: number;
  // File offsets of the range at `commit`.
  start: number;
  end: number;
  context: 'template' | 'js';
  // A whitespace-separated part of a string ('9px 18px', part 0).
  part?: number;
  // A unit the range takes after its `${…}`: `${fontSizes.xs}px` -> var().
  unit?: string;
  // The whole line at `commit`.
  lineText: string;
  // The traced code, for words: 'theme.borderRadius', '9px 18px'.
  text?: string;
};

export type CodeEdit = { line: number; old: string; new: string };

export type CodemodResult = CodeEdit | { byHand: string };

type Token = { start: number; end: number; label: string; value: unknown };

// @babel/parser's parse (typescript, jsx, tokens), injected so the shell
// loads it only when a change is sent.
export type Parse = (code: string) => { tokens?: unknown[]; program?: unknown };

type Node = { type: string; start: number; end: number; [k: string]: unknown };

const isNode = (v: unknown): v is Node =>
  !!v &&
  typeof v === 'object' &&
  typeof (v as Node).type === 'string' &&
  typeof (v as Node).start === 'number';

// The node spanning exactly [start, end), with its parent and the key it
// sits under; the outermost when several do.
const nodeAt = (
  root: unknown,
  start: number,
  end: number
): { node: Node; parent?: Node; key?: string } | undefined => {
  const stack: { node: Node; parent?: Node; key?: string }[] = isNode(root)
    ? [{ node: root }]
    : [];
  while (stack.length) {
    const at = stack.shift() as { node: Node; parent?: Node; key?: string };
    const { node } = at;
    if (node.start === start && node.end === end) return at;
    if (node.start > start || node.end < end) continue;
    for (const [key, v] of Object.entries(node)) {
      if (key === 'loc' || key === 'leadingComments') continue;
      const kids = Array.isArray(v) ? v : [v];
      for (const k of kids)
        if (isNode(k)) stack.push({ node: k, parent: node, key });
    }
  }
  return undefined;
};

// A whole value: an expression that is not the object of a member access,
// a callee, a tag or the target of an assignment.
const isWholeValue = (at: { node: Node; parent?: Node; key?: string }) => {
  if (!/(Expression|Literal|Identifier)$/.test(at.node.type)) return false;
  const p = at.parent?.type ?? '';
  if (/MemberExpression$/.test(p) && at.key === 'object') return false;
  if (/CallExpression$|NewExpression$/.test(p) && at.key === 'callee') {
    return false;
  }
  if (p === 'TaggedTemplateExpression' && at.key === 'tag') return false;
  if (/Assignment|Update/.test(p) && at.key !== 'right') return false;
  return true;
};

// The range is what the context says: a whole value in code; in a
// template, a whole `${…}` or text inside one quasi.
const rangeFits = (program: unknown, t: EditTrace, slice: string) => {
  if (t.context === 'js') {
    const at = nodeAt(program, t.start, t.end);
    return !!at && isWholeValue(at);
  }
  if (slice.startsWith('${')) {
    const tail = 1 + (t.unit?.length ?? 0);
    if (t.unit && !slice.endsWith(`}${t.unit}`)) return false;
    const at = nodeAt(program, t.start + 2, t.end - tail);
    return (
      !!at && at.parent?.type === 'TemplateLiteral' && at.key === 'expressions'
    );
  }
  const quasi = nodeAt(program, t.start, t.end);
  if (quasi) return quasi.node.type === 'TemplateElement';
  // Text inside a quasi: no `${` or backtick in it.
  return !/[`$\\]/.test(slice);
};

const parsed = (parse: Parse, code: string) => {
  try {
    return parse(code);
  } catch {
    return undefined;
  }
};

const tokensOf = (
  ast: { tokens?: unknown[] } | undefined
): Token[] | undefined => {
  if (!ast) return undefined;
  return (ast.tokens ?? []).map((t) => {
    const x = t as {
      start: number;
      end: number;
      type: { label: string } | string;
      value: unknown;
    };
    return {
      start: x.start,
      end: x.end,
      label: typeof x.type === 'string' ? x.type : x.type.label,
      value: x.value,
    };
  });
};

const sameToken = (a: Token, b: Token, shift = 0) =>
  a.label === b.label &&
  a.start + shift === b.start &&
  a.end + shift === b.end &&
  String(a.value) === String(b.value);

// The quote the file writes strings with: the one it uses more.
export const quoteOf = (text: string): "'" | '"' => {
  const single = (text.match(/'[^'\n]*'/g) ?? []).length;
  const double = (text.match(/"[^"\n]*"/g) ?? []).length;
  return double > single ? '"' : "'";
};

const QUOTES = new Set(["'", '"']);

// The text that replaces the range, or why there is none.
const replacementOf = (
  slice: string,
  t: EditTrace,
  read: string,
  quote: string
): string | { byHand: string } => {
  if (t.part !== undefined) {
    const q = slice[0];
    const quoted = QUOTES.has(q) && slice[slice.length - 1] === q;
    const inner = quoted ? slice.slice(1, -1) : slice;
    if (/[\\'"`$]/.test(inner)) {
      return { byHand: 'the string holds quotes or escapes' };
    }
    const parts = inner.split(/(\s+)/);
    const words = parts.filter((_, i) => i % 2 === 0);
    if (t.part < 0 || t.part >= words.length || !words[t.part]) {
      return { byHand: `the string has no part ${t.part}` };
    }
    parts[t.part * 2] = read;
    const next = parts.join('');
    return quoted ? `${q}${next}${q}` : next;
  }
  if (t.context === 'js') return `${quote}${read}${quote}`;
  // In a template: a whole `${…}` or static text becomes the var() itself.
  if (slice.startsWith('${') && !slice.endsWith(`}${t.unit ?? ''}`)) {
    return { byHand: 'the range is not a whole ${…}' };
  }
  return read;
};

/**
 * The one-line edit that writes `token` where the trace points, checked
 * against the file as it is now (`text`), or why it is left to a person.
 */
export const lineEditOf = (
  text: string,
  t: EditTrace,
  token: TokenName | string,
  parse: Parse
): CodemodResult => {
  if (!/^--gv-[a-z0-9-]+$/.test(token)) {
    return { byHand: `${token} is not a token name` };
  }
  const lines = text.split('\n');
  const lineText = lines[t.line - 1];
  // The range must lie on its line, and the line must read as it did when
  // it was traced.
  const lineStart =
    lines.slice(0, t.line - 1).reduce((n, l) => n + l.length + 1, 0) || 0;
  if (
    lineText === undefined ||
    lineText !== t.lineText ||
    t.start < lineStart ||
    t.end > lineStart + lineText.length ||
    t.end <= t.start
  ) {
    return { byHand: 'the code moved since the trace' };
  }
  const slice = text.slice(t.start, t.end);
  const read = `var(${token})`;
  const replacement = replacementOf(slice, t, read, quoteOf(text));
  if (typeof replacement !== 'string') return replacement;
  if (replacement === slice) return { byHand: 'it already reads the token' };
  const next = text.slice(0, t.start) + replacement + text.slice(t.end);

  // Verify: the range is a whole value, the token streams agree outside
  // it, and inside it the new tokens are exactly the replacement.
  const oldAst = parsed(parse, text);
  const before = tokensOf(oldAst);
  const after = tokensOf(parsed(parse, next));
  if (!before || !after) return { byHand: 'the file does not parse' };
  if (!rangeFits(oldAst?.program, t, slice)) {
    return { byHand: 'the range is not a whole value' };
  }
  const end = t.start + replacement.length;
  const shift = end - t.end;
  // In a template, the text around a replaced `${…}` joins the new text in
  // one quasi: those template tokens are the changed region too.
  const joins = (x: Token, from: number, to: number) =>
    t.context === 'template' &&
    x.label === 'template' &&
    x.end >= from &&
    x.start <= to;
  const oldHead = before.filter(
    (x) => x.end <= t.start && !joins(x, t.start, t.end)
  );
  const oldTail = before.filter(
    (x) => x.start >= t.end && !joins(x, t.start, t.end)
  );
  const newHead = after.filter(
    (x) => x.end <= t.start && !joins(x, t.start, end)
  );
  const newTail = after.filter(
    (x) => x.start >= end && !joins(x, t.start, end)
  );
  const newIn = after.filter(
    (x) => (x.end > t.start && x.start < end) || joins(x, t.start, end)
  );
  const equal =
    oldHead.length === newHead.length &&
    oldTail.length === newTail.length &&
    oldHead.every((x, i) => sameToken(x, newHead[i])) &&
    oldTail.every((x, i) => sameToken(x, newTail[i], shift));
  if (!equal) return { byHand: 'the edit would change code around it' };
  const exact =
    t.context === 'js'
      ? // One string, exactly the replacement.
        newIn.length === 1 &&
        newIn[0].label === 'string' &&
        newIn[0].start === t.start &&
        newIn[0].end === end &&
        newIn[0].value === replacement.slice(1, -1)
      : // One quasi of template text.
        newIn.length === 1 && newIn[0].label === 'template';
  if (!exact) return { byHand: 'the new text is more than the token' };
  const newLine = next.split('\n')[t.line - 1];
  if (next.split('\n').length !== lines.length) {
    return { byHand: 'the edit spans more than one line' };
  }
  return { line: t.line, old: lineText, new: newLine };
};

// A named value changed where the code defines it (`borderRadius: '3px',`
// in styleUtils.ts): every use follows, the way devs change one. The
// property on `line` named `key` must hold one literal or one name on that
// line; the new value is written in the same kind (a number stays a
// number, a string keeps its quotes) and the file must parse after.
export type DefineEdit = { line: number; key: string; value: string };

const NAME_PATH = /^[A-Za-z_$][\w$]*(\.[\w$]+)+$/;

const propertyOn = (root: unknown, key: string, line: number) => {
  const stack: unknown[] = [root];
  while (stack.length) {
    const n = stack.pop();
    if (!isNode(n)) continue;
    const loc = n.loc as { start: { line: number } } | undefined;
    const k = n.key as Node | undefined;
    if (
      n.type === 'ObjectProperty' &&
      loc?.start.line === line &&
      k &&
      (k.name === key || k.value === key)
    ) {
      return n;
    }
    for (const [name, v] of Object.entries(n)) {
      if (name === 'loc' || name.endsWith('Comments')) continue;
      for (const c of Array.isArray(v) ? v : [v]) if (isNode(c)) stack.push(c);
    }
  }
  return undefined;
};

export const defineEditOf = (
  text: string,
  d: DefineEdit,
  parse: Parse
): CodemodResult => {
  const lines = text.split('\n');
  const lineText = lines[d.line - 1];
  if (lineText === undefined) return { byHand: 'the code moved since the trace' };
  const ast = parsed(parse, text);
  const prop = ast && propertyOn(ast.program, d.key, d.line);
  if (!prop) return { byHand: `${d.key} is no longer defined on line ${d.line}` };
  const v = prop.value as Node;
  const vLoc = v.loc as { end: { line: number } };
  if (vLoc.end.line !== d.line) return { byHand: 'its value spans more lines' };
  const lineStart = lines
    .slice(0, d.line - 1)
    .reduce((n, l) => n + l.length + 1, 0);
  const old = text.slice(v.start, v.end);
  const value = d.value.trim();
  let written: string;
  if (v.type === 'NumericLiteral') {
    const n = /^(-?\d+(\.\d+)?)(px)?$/.exec(value);
    if (!n) return { byHand: `${d.key} is a number; ${value} is not` };
    written = n[1];
  } else if (v.type === 'StringLiteral' || v.type === 'MemberExpression') {
    if (/['"`\\\n]/.test(value)) return { byHand: `${value} has quotes in it` };
    const q = v.type === 'StringLiteral' ? old[0] : quoteOf(text);
    written = NAME_PATH.test(value) ? value : `${q}${value}${q}`;
  } else {
    return { byHand: `${d.key} is worked out from other values` };
  }
  if (written === old) return { byHand: 'it already has this value' };
  const next = text.slice(0, v.start) + written + text.slice(v.end);
  if (!parsed(parse, next)) return { byHand: 'the file would not parse' };
  const col = v.start - lineStart;
  return {
    line: d.line,
    old: lineText,
    new: lineText.slice(0, col) + written + lineText.slice(col + old.length),
  };
};
