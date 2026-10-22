import { parse } from '@babel/parser';
import traverseModule from '@babel/traverse';

// Interop: @babel/traverse is CJS with a `default` property under some loaders.
const traverse: typeof traverseModule =
  (traverseModule as unknown as { default?: typeof traverseModule }).default ??
  traverseModule;

// Calls that need a real colour or number, so a var() string breaks them.
const UNSAFE_FUNCTIONS = new Set([
  'parseInt',
  'parseFloat',
  'Number',
  'rgba',
  'rgb',
  'hsl',
  'hsla',
  'darken',
  'lighten',
  'transparentize',
  'opacify',
  'rgba',
  'mix',
  'tint',
  'shade',
  'saturate',
  'desaturate',
  'adjustHue',
  'readableColor',
  'getLuminance',
  'parseToRgb',
  'toColorString',
]);

// String methods that parse or slice the value.
const UNSAFE_METHODS = new Set([
  'slice',
  'split',
  'replace',
  'replaceAll',
  'match',
  'substring',
  'substr',
  'trim',
  'toFixed',
  'charAt',
]);

const ARITHMETIC = new Set(['+', '-', '*', '/', '%', '**']);
const COMPARISON = new Set(['===', '!==', '==', '!=', '<', '>', '<=', '>=']);

export type Offender = { line: number; label: string; text: string };

const calleeName = (callee: any): string | undefined => {
  if (callee.type === 'Identifier') return callee.name;
  if (callee.type === 'MemberExpression' && !callee.computed) {
    return callee.property.name;
  }
  return undefined;
};

// `theme`, `stylingConsts`, `props.theme`, `this.props.theme`, `theme?.x`.
const isThemeObject = (obj: any): boolean => {
  if (!obj) return false;
  if (obj.type === 'Identifier') {
    return obj.name === 'theme' || obj.name === 'stylingConsts';
  }
  if (
    obj.type === 'MemberExpression' ||
    obj.type === 'OptionalMemberExpression'
  ) {
    return (
      !obj.computed &&
      obj.property.type === 'Identifier' &&
      (obj.property.name === 'theme' || obj.property.name === 'stylingConsts')
    );
  }
  return false;
};

export const findOffenders = (source: string, key: string): Offender[] => {
  const ast = parse(source, {
    sourceType: 'module',
    plugins: ['typescript', 'jsx'],
    errorRecovery: true,
  });
  const lines = source.split('\n');
  const out: Offender[] = [];
  const report = (node: any, label: string) => {
    const line = node.loc.start.line;
    out.push({ line, label, text: lines[line - 1].trim() });
  };

  traverse(ast, {
    'MemberExpression|OptionalMemberExpression'(path: any) {
      const node = path.node;
      if (
        node.computed ||
        node.property.type !== 'Identifier' ||
        node.property.name !== key ||
        !isThemeObject(node.object)
      ) {
        return;
      }
      const parent = path.parentPath;
      const pn = parent.node;

      // fn(theme.key) or fn(a, theme.key), including multi-line calls.
      if (
        (pn.type === 'CallExpression' ||
          pn.type === 'OptionalCallExpression') &&
        pn.arguments.includes(node)
      ) {
        const name = calleeName(pn.callee);
        if (name && UNSAFE_FUNCTIONS.has(name)) report(node, `${name}()`);
      }
      // theme.key.slice(...) and friends.
      if (
        (parent.isMemberExpression() || parent.isOptionalMemberExpression()) &&
        pn.object === node &&
        !pn.computed &&
        UNSAFE_METHODS.has(pn.property.name)
      ) {
        report(node, `.${pn.property.name}()`);
      }
      // theme.key + 2, 2 * theme.key, theme.key === '3px'.
      if (pn.type === 'BinaryExpression') {
        if (ARITHMETIC.has(pn.operator))
          report(node, `arithmetic ${pn.operator}`);
        else if (COMPARISON.has(pn.operator))
          report(node, `comparison ${pn.operator}`);
      }
      if (
        pn.type === 'UnaryExpression' &&
        (pn.operator === '-' || pn.operator === '+')
      ) {
        report(node, `unary ${pn.operator}`);
      }
      // `${theme.key} * 2` in a template, but calc(${theme.key} * 2) is valid.
      // Look through `(props) => theme.key` interpolations.
      let holder = node;
      let hp = parent;
      if (hp.isArrowFunctionExpression() && hp.node.body === node) {
        holder = hp.node;
        hp = hp.parentPath;
      }
      const tn = hp.node;
      if (tn.type === 'TemplateLiteral') {
        const pn = tn;
        const i = pn.expressions.indexOf(holder);
        const before: string = pn.quasis[i].value.raw;
        const after: string = pn.quasis[i + 1].value.raw;
        const mathAfter = /^\s*[*/]\s*[\d(.$]/.test(after);
        const mathBefore = /[\d)$}.]\s*[*/]\s*$/.test(before);
        const inCalc = /calc\([^)]*$/.test(before);
        if ((mathAfter || mathBefore) && !inCalc) {
          report(node, 'template arithmetic');
        }
      }
    },
  });
  return out;
};
