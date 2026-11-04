/*
 * The inline style objects of the story files and the Storybook setup:
 * `style={{ width: 524, padding: 18 }}` in JSX. No story file or decorator
 * here writes a styled component, so a story frame (the wrapper a story or
 * a decorator draws around the component) is always one of these. The trace
 * joins an element's inline style to the one object here whose entries
 * equal the style React holds for it, key for key and value for value.
 *
 * Only an object whose every entry is a plain key with a string or number
 * literal is indexed as `static`; any spread, computed key or expression
 * makes it dynamic, and a dynamic object is never matched.
 */
import { parse } from '@babel/parser';
import traverseModule from '@babel/traverse';

import { Lines } from './loc';
import { Loc } from './schema';

// @babel/traverse is CommonJS: its default export sits on .default under
// some loaders.
const traverse: typeof traverseModule =
  (traverseModule as unknown as { default?: typeof traverseModule }).default ??
  traverseModule;

export type StyleEntry = { value: string | number; loc: Loc };

export type StyleObject = {
  file: string;
  loc: Loc;
  // Only when every entry is static.
  entries?: Record<string, StyleEntry>;
};

// Files whose inline styles are story frames: story files and the
// Storybook setup (not the workbench app, which is not on the canvas).
export const isFrameFile = (file: string) =>
  /\.stories\.tsx?$/.test(file) ||
  (file.startsWith('.storybook/') && !file.startsWith('.storybook/workbench/'));

const keyOf = (key: unknown): string | undefined => {
  const k = key as { type: string; name?: string; value?: unknown };
  if (k.type === 'Identifier') return k.name;
  if (k.type === 'StringLiteral') return String(k.value);
  return undefined;
};

const literalOf = (node: unknown): string | number | undefined => {
  const n = node as {
    type: string;
    value?: unknown;
    operator?: string;
    argument?: { type: string; value?: unknown };
    expressions?: unknown[];
    quasis?: { value: { cooked?: string } }[];
  };
  if (n.type === 'StringLiteral') return String(n.value);
  if (n.type === 'NumericLiteral') return Number(n.value);
  if (
    n.type === 'UnaryExpression' &&
    n.operator === '-' &&
    n.argument?.type === 'NumericLiteral'
  ) {
    return -Number(n.argument.value);
  }
  if (n.type === 'TemplateLiteral' && n.expressions?.length === 0) {
    return n.quasis?.[0]?.value.cooked;
  }
  return undefined;
};

/** Every `style={{…}}` object literal of a file, in source order. */
export const styleObjectsOf = (file: string, code: string): StyleObject[] => {
  const ast = parse(code, {
    sourceType: 'module',
    plugins: ['typescript', 'jsx'],
  });
  const lines = new Lines(code);
  const out: StyleObject[] = [];
  traverse(ast, {
    JSXAttribute(path) {
      const { node } = path;
      if (node.name.type !== 'JSXIdentifier' || node.name.name !== 'style') {
        return;
      }
      const value = node.value;
      if (value?.type !== 'JSXExpressionContainer') return;
      const obj = value.expression;
      if (obj.type !== 'ObjectExpression') return;
      const entries: Record<string, StyleEntry> = {};
      let dynamic = false;
      for (const p of obj.properties) {
        if (p.type !== 'ObjectProperty' || p.computed) {
          dynamic = true;
          continue;
        }
        const key = keyOf(p.key);
        const lit = literalOf(p.value);
        if (key === undefined || lit === undefined) {
          dynamic = true;
          continue;
        }
        entries[key] = {
          value: lit,
          loc: lines.loc(p.start ?? 0, p.end ?? 0),
        };
      }
      out.push({
        file,
        loc: lines.loc(obj.start ?? 0, obj.end ?? 0),
        ...(dynamic ? {} : { entries }),
      });
    },
  });
  return out;
};

/**
 * The indexed objects whose entries equal `style` exactly: the same keys,
 * each value strictly equal (React keeps 18 as 18 and '18px' as '18px').
 */
export const matchStyle = (
  objects: StyleObject[],
  style: Record<string, unknown>
): StyleObject[] => {
  const keys = Object.keys(style).filter((k) => style[k] !== undefined);
  return objects.filter((o) => {
    if (!o.entries) return false;
    const own = Object.keys(o.entries);
    return (
      own.length === keys.length &&
      keys.every((k) => o.entries?.[k] && o.entries[k].value === style[k])
    );
  });
};
