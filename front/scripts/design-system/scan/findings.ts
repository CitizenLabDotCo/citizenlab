import { parse } from '@babel/parser';
import traverseModule from '@babel/traverse';

import { NAMED_COLORS, NAMED_COLOR_NAMES } from './namedColors';
import { Finding, FindingCategory, TokenMeta } from './schema';

// Interop: @babel/traverse is CJS with a `default` property under some loaders.
const traverse: typeof traverseModule =
  (traverseModule as unknown as { default?: typeof traverseModule }).default ??
  traverseModule;

type Suggestion = { token: string; distance: number };

// ---------------------------------------------------------------------------
// Value parsing and distances

const parsePx = (raw: string): number | undefined => {
  const m = /^\s*(-?\d*\.?\d+)px\s*$/.exec(raw);
  return m ? parseFloat(m[1]) : undefined;
};

type RGB = [number, number, number];

const parseColor = (raw: string): RGB | undefined => {
  const s = raw.trim().toLowerCase();
  const hex = /^#([0-9a-f]{3,8})$/.exec(s);
  if (hex) {
    let h = hex[1];
    if (h.length === 3 || h.length === 4) {
      h = h
        .split('')
        .map((c) => c + c)
        .join('');
    }
    if (h.length !== 6 && h.length !== 8) return undefined;
    return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as RGB;
  }
  const fn = /^rgba?\(\s*([\d.]+)\s*[, ]\s*([\d.]+)\s*[, ]\s*([\d.]+)/.exec(s);
  if (fn) return [Number(fn[1]), Number(fn[2]), Number(fn[3])];
  if (NAMED_COLORS[s]) return parseColor(NAMED_COLORS[s]);
  return undefined;
};

const toLab = ([r, g, b]: RGB): RGB => {
  const lin = (v: number) => {
    const c = v / 255;
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  const [lr, lg, lb] = [lin(r), lin(g), lin(b)];
  // sRGB to XYZ (D65), normalised to the D65 white point.
  const x = (lr * 0.4124564 + lg * 0.3575761 + lb * 0.1804375) / 0.95047;
  const y = lr * 0.2126729 + lg * 0.7151522 + lb * 0.072175;
  const z = (lr * 0.0193339 + lg * 0.119192 + lb * 0.9503041) / 1.08883;
  const f = (t: number) =>
    t > 216 / 24389 ? Math.cbrt(t) : ((24389 / 27) * t + 16) / 116;
  const [fx, fy, fz] = [f(x), f(y), f(z)];
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
};

// CIE76: Euclidean distance in Lab.
const deltaE76 = (a: RGB, b: RGB): number => {
  const [l1, a1, b1] = toLab(a);
  const [l2, a2, b2] = toLab(b);
  return Math.sqrt((l1 - l2) ** 2 + (a1 - a2) ** 2 + (b1 - b2) ** 2);
};

const round = (n: number) => Math.round(n * 100) / 100;

/**
 * Nearest token by value (uses each token's `values.today`). Exact match wins
 * (distance 0), otherwise the closest; ties break on token name so output is
 * deterministic. px distance is absolute px; colour distance is CIE76 in Lab.
 * `tokenCategory` optionally restricts the pool (`space`, `radius`, ...);
 * without it, px values are compared against `space` tokens and colours
 * against `color` tokens.
 */
export const nearestToken = (
  raw: string,
  category: FindingCategory,
  tokens: TokenMeta[],
  tokenCategory?: string
): Suggestion | undefined => {
  let best: Suggestion | undefined;
  const consider = (token: string, distance: number) => {
    const d = round(distance);
    if (
      !best ||
      d < best.distance ||
      (d === best.distance && token < best.token)
    ) {
      best = { token, distance: d };
    }
  };

  if (category === 'px' || category === 'layout-spacing') {
    const px = parsePx(raw);
    if (px === undefined) return undefined;
    tokens
      .filter((t) => t.category === (tokenCategory ?? 'space'))
      .forEach((t) => {
        const v = parsePx(t.values.today);
        if (v !== undefined) consider(t.name, Math.abs(v - px));
      });
    return best;
  }

  if (category === 'hex' || category === 'rgba' || category === 'named-color') {
    const rgb = parseColor(raw);
    if (!rgb) return undefined;
    tokens
      .filter((t) => t.category === (tokenCategory ?? 'color'))
      .forEach((t) => {
        const v = parseColor(t.values.today);
        if (v) consider(t.name, deltaE76(rgb, v));
      });
    return best;
  }
  return undefined;
};

const confidenceFor = (
  category: FindingCategory,
  s: Suggestion | undefined
): Finding['confidence'] => {
  if (!s) return 'low';
  const isColor = category !== 'px' && category !== 'layout-spacing';
  if (s.distance === 0) return 'high';
  return s.distance <= (isColor ? 5 : 2) ? 'medium' : 'low';
};

// ---------------------------------------------------------------------------
// CSS text scanning

const PX_RE = /(?<![\w.#-])\d*\.?\d+px\b/g;
const HEX_RE = /#[0-9a-fA-F]{3,8}\b/g;
const RGBA_RE = /\brgba?\(/g;
const NAMED_RE = new RegExp(
  `(?<![\\w#.$@-])(${NAMED_COLOR_NAMES.join('|')})(?![\\w-])`,
  'g'
);
const GV_VAR_RE = /var\(\s*(--gv-[\w-]+)[^)]*\)/g;

// Token category a px value in this CSS property should be compared to, or
// null when no token family applies (borders, shadows, ...).
const tokenCategoryFor = (property: string | undefined): string | null => {
  if (!property) return 'space';
  if (/radius/.test(property)) return 'radius';
  if (/^(font-size|line-height|letter-spacing)$/.test(property)) return 'font';
  if (
    /^(border|outline|box-shadow|text-shadow|filter|transition)/.test(property)
  )
    return null;
  return 'space';
};

const propertyAt = (text: string, index: number): string | undefined => {
  const before = text.slice(0, index);
  const start = Math.max(
    before.lastIndexOf(';'),
    before.lastIndexOf('{'),
    before.lastIndexOf('}')
  );
  const m = /([a-zA-Z-]+)\s*:[^:]*$/.exec(before.slice(start + 1));
  return m ? m[1].toLowerCase() : undefined;
};

const blankComments = (text: string) =>
  text.replace(/\/\*[\s\S]*?\*\//g, (c) => c.replace(/[^\n]/g, ' '));

type Origin = { line: number; col: number }; // 1-based position of text[0]

const locate = (text: string, index: number, origin: Origin) => {
  const before = text.slice(0, index);
  const nl = before.lastIndexOf('\n');
  const lines = before.split('\n').length - 1;
  return {
    line: origin.line + lines,
    col: nl === -1 ? origin.col + index : index - nl,
  };
};

type Emit = (
  f: Omit<Finding, 'file' | 'confidence' | 'component'> & {
    confidence?: Finding['confidence'];
  }
) => void;

/** Literal findings (px, hex, rgba, named colours) in a chunk of CSS text. */
const scanCssText = (
  rawText: string,
  origin: Origin,
  tokens: TokenMeta[],
  emit: Emit,
  forcedProperty?: string
) => {
  const text = blankComments(rawText);
  const push = (match: RegExpExecArray, category: FindingCategory) => {
    const pos = locate(text, match.index, origin);
    const value = match[0];
    let suggestion: Suggestion | undefined;
    if (category === 'px') {
      const tc = tokenCategoryFor(
        forcedProperty ?? propertyAt(text, match.index)
      );
      if (tc) suggestion = nearestToken(value, 'px', tokens, tc);
    } else {
      suggestion = nearestToken(value, category, tokens);
    }
    emit({
      ...pos,
      raw: value,
      category,
      suggestion,
      confidence: confidenceFor(category, suggestion),
    });
  };

  for (const m of text.matchAll(PX_RE)) push(m, 'px');
  for (const m of text.matchAll(HEX_RE)) push(m, 'hex');
  for (const m of text.matchAll(RGBA_RE)) {
    // Take the whole call when it closes on this line, for the suggestion.
    const close = text.indexOf(')', m.index!);
    const call = close === -1 ? m[0] : text.slice(m.index!, close + 1);
    const fake = Object.assign([call], { index: m.index }) as RegExpExecArray;
    push(fake, 'rgba');
  }
  // Named colours only count in declaration values: after a `:` and before
  // the next `;`, `{` or `}`. That excludes selectors and property names.
  for (const seg of text.matchAll(/:([^;{}]*)/g)) {
    const base = seg.index! + 1;
    for (const m of seg[1].matchAll(NAMED_RE)) {
      const fake = Object.assign([m[0]], {
        index: base + m.index!,
      }) as RegExpExecArray;
      push(fake, 'named-color');
    }
  }
};

// ---------------------------------------------------------------------------
// AST helpers

const LAYOUT_COMPONENTS = new Set([
  'Box',
  'Flex',
  'Grid',
  'Stack',
  'Text',
  'Title',
  'Button',
  'Icon',
]);
const SPACING_PROP_RE =
  /^(padding\w*|margin\w*|(row|column)?[gG]ap|[pm][tblrxy]?)$/;

const rootsAtStyled = (node: any): boolean => {
  if (!node) return false;
  switch (node.type) {
    case 'Identifier':
      return node.name === 'styled';
    case 'MemberExpression':
      return rootsAtStyled(node.object);
    case 'CallExpression':
      return rootsAtStyled(node.callee);
    default:
      return false;
  }
};

const isCssTag = (tag: any): boolean =>
  tag.type === 'Identifier' &&
  (tag.name === 'css' || tag.name === 'createGlobalStyle');

const jsxName = (n: any): string | undefined => {
  if (!n) return undefined;
  if (n.type === 'JSXIdentifier') return n.name;
  if (n.type === 'JSXMemberExpression') return jsxName(n.property);
  return undefined;
};

/**
 * Per-file findings. Pure: receives the source, never touches the file system.
 * Lines and columns are 1-based. Returns [] for source that does not parse.
 * Output is sorted by position then category so it is deterministic.
 */
export const scanFile = (
  filePath: string,
  source: string,
  tokens: TokenMeta[]
): Finding[] => {
  let ast;
  try {
    ast = parse(source, {
      sourceType: 'module',
      plugins: ['typescript', 'jsx'],
      errorRecovery: false,
    });
  } catch {
    return [];
  }

  const findings: Finding[] = [];
  const mk =
    (component?: string): Emit =>
    (f) =>
      findings.push({
        file: filePath,
        confidence: 'high',
        ...f,
        ...(component ? { component } : {}),
      });
  const pos = (n: any) => ({
    line: n.loc.start.line,
    col: n.loc.start.column + 1,
  });
  const slice = (n: any) => source.slice(n.start, n.end);

  const enclosingName = (path: any): string | undefined => {
    const decl = path.findParent((p: any) => p.isVariableDeclarator());
    return decl?.node.id?.type === 'Identifier' ? decl.node.id.name : undefined;
  };

  const scanStringValue = (
    value: string,
    node: any,
    property: string | undefined,
    emit: Emit
  ) => {
    // +1 skips the opening quote (string literal) or backtick.
    const origin = {
      line: node.loc.start.line,
      col: node.loc.start.column + 2,
    };
    scanCssText(
      value,
      origin,
      tokens,
      emit,
      property?.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)
    );
  };

  traverse(ast, {
    TaggedTemplateExpression(path) {
      const { tag, quasi } = path.node;
      const styled = rootsAtStyled(tag);
      if (!styled && !isCssTag(tag)) return;
      const name = enclosingName(path);
      const emit = mk(name);
      if (styled) {
        emit({ ...pos(path.node), raw: slice(tag), category: 'styled-block' });
      }
      quasi.quasis.forEach((q) => {
        scanCssText(
          q.value.raw,
          { line: q.loc!.start.line, col: q.loc!.start.column + 1 },
          tokens,
          emit
        );
      });
    },

    JSXAttribute(path) {
      const attr = path.node;
      if (attr.name.type !== 'JSXIdentifier') return;
      const opening = path.parent as any;
      const element = jsxName(opening.name);

      if (attr.name.name === 'style') {
        const v: any = attr.value;
        if (v?.type !== 'JSXExpressionContainer') return;
        if (v.expression.type !== 'ObjectExpression') return;
        const emit = mk(element);
        v.expression.properties.forEach((p: any) => {
          if (p.type !== 'ObjectProperty') return;
          const key = p.key.name ?? p.key.value;
          const val = p.value;
          if (val.type === 'StringLiteral') {
            scanStringValue(val.value, val, key, emit);
          }
        });
        return;
      }

      if (!element || !LAYOUT_COMPONENTS.has(element)) return;
      if (!SPACING_PROP_RE.test(attr.name.name)) return;
      let lit: any = attr.value;
      if (lit?.type === 'JSXExpressionContainer') lit = lit.expression;
      if (lit?.type !== 'StringLiteral') return;
      for (const m of lit.value.matchAll(/(?<![\w.])\d*\.?\d+px\b/g)) {
        const suggestion = nearestToken(m[0], 'layout-spacing', tokens);
        mk(element)({
          line: lit.loc.start.line,
          col: lit.loc.start.column + 2 + m.index!,
          raw: m[0],
          category: 'layout-spacing',
          suggestion,
          confidence: confidenceFor('layout-spacing', suggestion),
        });
      }
    },

    MemberExpression(path) {
      const n: any = path.node;
      const obj = n.object;
      let category: FindingCategory | undefined;
      if (obj.type === 'Identifier') {
        if (obj.name === 'bo') category = 'legacy-bo';
        else if (obj.name === 'colors') category = 'legacy-colors';
        else if (obj.name === 'theme') {
          const parent: any = path.parent;
          const nextIsColors =
            parent.type === 'MemberExpression' &&
            parent.object === n &&
            !parent.computed &&
            n.property.name === 'colors';
          category = nextIsColors ? 'legacy-colors' : 'legacy-theme';
          if (nextIsColors) {
            // Report the whole `theme.colors.x` read once, at the inner node.
            mk(enclosingName(path))({
              ...pos(parent),
              raw: slice(parent),
              category,
            });
            return;
          }
        }
      } else if (
        obj.type === 'MemberExpression' &&
        obj.object.type === 'Identifier' &&
        obj.object.name === 'props' &&
        obj.property.name === 'theme'
      ) {
        category = 'legacy-theme';
      }
      if (!category) return;
      // `theme.colors` alone (not read further) is handled above only when
      // followed by a member; a bare `theme.colors` falls through as theme.
      mk(enclosingName(path))({ ...pos(n), raw: slice(n), category });
    },

    TemplateElement(path) {
      const q = path.node;
      // Plain strings and templates; styled/css quasis are handled above but
      // var() reads must be counted exactly once, so count them here for all.
      for (const m of q.value.raw.matchAll(GV_VAR_RE)) {
        mk(enclosingName(path))({
          ...locate(q.value.raw, m.index!, {
            line: q.loc!.start.line,
            col: q.loc!.start.column + 1,
          }),
          raw: m[0],
          category: 'token-var',
        });
      }
    },

    StringLiteral(path) {
      const n = path.node;
      for (const m of n.value.matchAll(GV_VAR_RE)) {
        mk(enclosingName(path))({
          line: n.loc!.start.line,
          col: n.loc!.start.column + 2 + m.index!,
          raw: m[0],
          category: 'token-var',
        });
      }
    },
  });

  return findings.sort(
    (a, b) =>
      a.line - b.line ||
      a.col - b.col ||
      a.category.localeCompare(b.category) ||
      a.raw.localeCompare(b.raw)
  );
};
