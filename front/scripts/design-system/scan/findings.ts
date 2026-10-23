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
// Red, green and blue 0-255, alpha 0-1.
type RGBA = [number, number, number, number];

// Two alphas are the same within half of one 8-bit step, so `#00000080`
// (0.502) matches `rgba(0, 0, 0, 0.5)`.
const ALPHA_TOLERANCE = 0.002;

const parseColor = (raw: string): RGBA | undefined => {
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
    const n = (i: number) => parseInt(h.slice(i, i + 2), 16);
    return [n(0), n(2), n(4), h.length === 8 ? n(6) / 255 : 1];
  }
  const fn =
    /^rgba?\(\s*([\d.]+)\s*[, ]\s*([\d.]+)\s*[, ]\s*([\d.]+)(?:\s*[,/ ]\s*([\d.]+)(%?))?/.exec(
      s
    );
  if (fn) {
    let a = fn[4] === undefined ? 1 : Number(fn[4]);
    if (fn[5] === '%') a /= 100;
    return [Number(fn[1]), Number(fn[2]), Number(fn[3]), a];
  }
  if (NAMED_COLORS[s]) return parseColor(NAMED_COLORS[s]);
  return undefined;
};

/**
 * Whether two CSS colours are the same: RGB within half a step, alpha within
 * ALPHA_TOLERANCE. Undefined when either is not a colour this parser reads.
 */
export const sameColor = (a: string, b: string): boolean | undefined => {
  const x = parseColor(a);
  const y = parseColor(b);
  if (!x || !y) return undefined;
  return (
    [0, 1, 2].every((i) => Math.abs(x[i] - y[i]) < 0.5) &&
    Math.abs(x[3] - y[3]) <= ALPHA_TOLERANCE
  );
};

const toLab = ([r, g, b]: RGB | RGBA): RGB => {
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
const deltaE76 = (a: RGBA, b: RGBA): number => {
  const [l1, a1, b1] = toLab(a);
  const [l2, a2, b2] = toLab(b);
  return Math.sqrt((l1 - l2) ** 2 + (a1 - a2) ** 2 + (b1 - b2) ** 2);
};

const round = (n: number) => Math.round(n * 100) / 100;

/**
 * Nearest token by value (uses each token's `values.today`). Exact match wins
 * (distance 0), otherwise the closest; ties prefer tier-1 primitives over
 * tier-2 semantics, then token name, so output is
 * deterministic. px distance is absolute px; colour distance is CIE76 in Lab,
 * among tokens of the same alpha only.
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
  let bestTier = 2;
  const consider = (token: string, distance: number, tier: 1 | 2) => {
    const d = round(distance);
    if (
      !best ||
      d < best.distance ||
      (d === best.distance &&
        (tier < bestTier || (tier === bestTier && token < best.token)))
    ) {
      best = { token, distance: d };
      bestTier = tier;
    }
  };

  if (category === 'px' || category === 'layout-spacing') {
    const px = parsePx(raw);
    if (px === undefined) return undefined;
    tokens
      .filter((t) => t.category === (tokenCategory ?? 'space'))
      .forEach((t) => {
        const v = parsePx(t.values.today);
        if (v !== undefined) consider(t.name, Math.abs(v - px), t.tier);
      });
    return best;
  }

  if (category === 'hex' || category === 'rgba' || category === 'named-color') {
    const rgba = parseColor(raw);
    if (!rgba) return undefined;
    // Only a token of the same alpha can stand in: an opaque token is not a
    // suggestion for a translucent colour, however close its RGB.
    tokens
      .filter((t) => t.category === (tokenCategory ?? 'color'))
      .forEach((t) => {
        const v = parseColor(t.values.today);
        if (v && Math.abs(v[3] - rgba[3]) <= ALPHA_TOLERANCE) {
          consider(t.name, deltaE76(rgba, v), t.tier);
        }
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

const blank = (c: string) => c.replace(/[^\n]/g, ' ');

// The fallback of a design token variable, `var(--gv-radius, 3px)`, is not a
// hard-coded value: the token wins whenever it is defined. Blank everything
// after the comma up to the matching `)`, keeping positions and newlines.
const blankGvFallbacks = (text: string) => {
  let out = text;
  for (const m of text.matchAll(/var\(\s*--gv-[\w-]+\s*,/g)) {
    const start = m.index! + m[0].length;
    let depth = 1;
    let i = start;
    for (; i < text.length && depth > 0; i++) {
      if (text[i] === '(') depth++;
      else if (text[i] === ')') depth--;
    }
    if (depth !== 0) continue;
    out =
      out.slice(0, start) + blank(out.slice(start, i - 1)) + out.slice(i - 1);
  }
  return out;
};

// Blank (with spaces, so positions survive) everything that is not a CSS
// value: url(...) bodies, quoted strings, block comments and `//` line
// comments. Order matters: urls and strings first so `//` inside
// `url(https://x)` or "http://x" is never read as a comment.
// Token variable fallbacks are blanked as well (see above).
const blankNonValues = (text: string) =>
  blankGvFallbacks(text)
    .replace(/url\(([^)]*)\)/gi, (_m, body) => 'url(' + blank(body) + ')')
    .replace(/(["'])(?:\\.|(?!\1)[^\\\n])*\1/g, blank)
    .replace(/\/\*[\s\S]*?\*\//g, blank)
    .replace(/\/\/[^\n]*/g, blank);

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
  emit: Emit
) => {
  const text = blankNonValues(rawText);
  const push = (match: RegExpExecArray, category: FindingCategory) => {
    const pos = locate(text, match.index, origin);
    const value = match[0];
    let suggestion: Suggestion | undefined;
    if (category === 'px') {
      const tc = tokenCategoryFor(propertyAt(text, match.index));
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
// Non-spacing style props of the primitives whose px literals count as `px`.
const STYLE_PROP_COMPONENTS = new Set([...LAYOUT_COMPONENTS, 'Image']);
const STYLE_PX_PROP_RE =
  /^(w|h|width|height|(min|max)(Width|Height|W|H)|border\w*|fontSize|lineHeight|top|left|right|bottom)$/;
// Keys of plain objects that are CSS properties (camelCase).
const CSS_KEY_RE =
  /^((padding|margin|border|outline)\w*|(min|max)?(Width|Height)|width|height|fontSize|lineHeight|letterSpacing|top|left|right|bottom|gap|rowGap|columnGap|boxShadow)$/;
// A string that holds at least one CSS declaration (`prop: value;`).
const CSS_DECL_RE = /(^|[\s;{])-?[a-z][a-z-]*\s*:\s*[^;:{}]+;/;
const JSX_PX_RE = /(?<![\w.])\d*\.?\d+px\b/g;
const kebab = (prop: string) =>
  prop.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

const rootsAtStyled = (node: any): boolean => {
  if (!node) return false;
  switch (node.type) {
    case 'Identifier':
      // `typedStyled` (utils/cl-router/Link) wraps styled() for typed links.
      return node.name === 'styled' || node.name === 'typedStyled';
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

const ARRAY_METHODS = new Set(
  Object.getOwnPropertyNames(Array.prototype).concat(['length'])
);

const jsxName = (n: any): string | undefined => {
  if (!n) return undefined;
  if (n.type === 'JSXIdentifier') return n.name;
  if (n.type === 'JSXMemberExpression') return jsxName(n.property);
  return undefined;
};

export type ParseError = { message: string; line?: number; col?: number };
export type ScanResult = { findings: Finding[]; parseError?: ParseError };

/**
 * Per-file findings plus the parse failure, if any. Pure: receives the source,
 * never touches the file system. Lines and columns are 1-based. On a syntax
 * error `findings` is [] and `parseError` says where, so callers can count and
 * warn. Output is sorted by position then category (deterministic).
 * `.ts` files are parsed without the jsx plugin (so `<File>value` assertions
 * work); `.tsx`/`.jsx`/other files with it. Decorators (legacy) are enabled.
 */
/**
 * Parse with the scanner's options. Throws on a syntax error. Exported so the
 * CLI can parse each file once and share the AST (imports, usages, findings).
 */
export const parseSource = (filePath: string, source: string) => {
  const isPlainTs = /\.(ts|mts|cts)$/.test(filePath);
  return parse(source, {
    sourceType: 'module',
    plugins: [
      'typescript',
      ...(isPlainTs ? [] : (['jsx'] as const)),
      'decorators-legacy',
    ],
  });
};

export type ParsedFile = ReturnType<typeof parseSource>;

export const scanFileResult = (
  filePath: string,
  source: string,
  tokens: TokenMeta[],
  parsed?: ParsedFile
): ScanResult => {
  let ast;
  try {
    ast = parsed ?? parseSource(filePath, source);
  } catch (e: any) {
    return {
      findings: [],
      parseError: {
        message: String(e?.message ?? e),
        line: e?.loc?.line,
        col: e?.loc ? e.loc.column + 1 : undefined,
      },
    };
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

  // A style-object value is scanned as a declaration (`prop: value`) so the
  // same px/colour/named-colour rules apply as in a styled template.
  const scanStringValue = (
    value: string,
    node: any,
    property: string,
    emit: Emit
  ) => {
    const prefix =
      property.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`) + ': ';
    // +2 skips the opening quote (columns are 1-based).
    const origin = {
      line: node.loc.start.line,
      col: node.loc.start.column + 2 - prefix.length,
    };
    scanCssText(prefix + value, origin, tokens, emit);
  };

  // `colors` and `bo` only count when imported from the component library's
  // style utils (or the admin graph styling re-export), never as plain names.
  const legacyImports = new Map<string, FindingCategory>();
  ast.program.body.forEach((node: any) => {
    if (node.type !== 'ImportDeclaration') return;
    if (!/(component-library|styleUtils|\/styling)$/.test(node.source.value))
      return;
    node.specifiers.forEach((sp: any) => {
      if (sp.type !== 'ImportSpecifier') return;
      const imported = sp.imported.name ?? sp.imported.value;
      if (imported === 'colors')
        legacyImports.set(sp.local.name, 'legacy-colors');
      if (imported === 'bo') legacyImports.set(sp.local.name, 'legacy-bo');
    });
  });

  // `t` from the generated token module (`t.radius.panel`, `t.space[4]`)
  // reads a --gv- variable, like a var() string does.
  const tokenApi = new Set<string>();
  ast.program.body.forEach((node: any) => {
    if (node.type !== 'ImportDeclaration') return;
    if (!/(^|\/)design-system\/tokens\/tokens$/.test(node.source.value)) return;
    node.specifiers.forEach((sp: any) => {
      if (sp.type !== 'ImportSpecifier') return;
      if ((sp.imported.name ?? sp.imported.value) === 't')
        tokenApi.add(sp.local.name);
    });
  });

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
          if (p.type !== 'ObjectProperty' || p.computed) return;
          const key = p.key.name ?? p.key.value;
          if (typeof key !== 'string') return;
          const val = p.value;
          if (val.type === 'StringLiteral') {
            scanStringValue(val.value, val, key, emit);
          }
        });
        return;
      }

      if (!element) return;
      const prop = attr.name.name;
      const spacing =
        LAYOUT_COMPONENTS.has(element) && SPACING_PROP_RE.test(prop);
      const stylePx =
        STYLE_PROP_COMPONENTS.has(element) && STYLE_PX_PROP_RE.test(prop);
      if (!spacing && !stylePx) return;
      let lit: any = attr.value;
      if (lit?.type === 'JSXExpressionContainer') lit = lit.expression;
      // String literal, or the static parts of a template (`1px solid ${c}`).
      // Conditional and logical values contribute both branches.
      const pieces: { text: string; origin: Origin }[] = [];
      const collect = (v: any) => {
        if (v?.type === 'StringLiteral') {
          pieces.push({
            text: v.value,
            origin: { line: v.loc.start.line, col: v.loc.start.column + 2 },
          });
        } else if (v?.type === 'TemplateLiteral') {
          v.quasis.forEach((q: any) =>
            pieces.push({
              text: q.value.raw,
              origin: { line: q.loc.start.line, col: q.loc.start.column + 1 },
            })
          );
        } else if (v?.type === 'ConditionalExpression') {
          collect(v.consequent);
          collect(v.alternate);
        } else if (v?.type === 'LogicalExpression') {
          collect(v.left);
          collect(v.right);
        }
      };
      collect(lit);
      const category: FindingCategory = spacing ? 'layout-spacing' : 'px';
      const tc = spacing ? undefined : tokenCategoryFor(kebab(prop));
      pieces.forEach(({ text: rawText, origin }) => {
        const text = blankGvFallbacks(rawText);
        for (const m of text.matchAll(JSX_PX_RE)) {
          const suggestion = spacing
            ? nearestToken(m[0], 'layout-spacing', tokens)
            : tc
            ? nearestToken(m[0], 'px', tokens, tc)
            : undefined;
          mk(element)({
            ...locate(text, m.index!, origin),
            raw: m[0],
            category,
            suggestion,
            confidence: confidenceFor(category, suggestion),
          });
        }
      });
    },

    // Plain (untagged) strings and templates that hold CSS declarations,
    // e.g. `const segment = \`padding: 5px 14px;\`` interpolated later.
    // Tagged styled/css templates are scanned above.
    TemplateLiteral(path: any) {
      const n = path.node;
      if (path.parent.type === 'TaggedTemplateExpression') return;
      const joined = n.quasis.map((q: any) => q.value.raw).join(' ');
      if (!CSS_DECL_RE.test(joined)) return;
      const emit = mk(enclosingName(path));
      n.quasis.forEach((q: any) =>
        scanCssText(
          q.value.raw,
          { line: q.loc.start.line, col: q.loc.start.column + 1 },
          tokens,
          emit
        )
      );
    },

    // Plain objects with CSS-property keys (`{ paddingTop: '6px' }`); the
    // JSX style={{...}} object is handled by the JSXAttribute branch.
    ObjectProperty(path: any) {
      const p = path.node;
      if (p.computed || p.value.type !== 'StringLiteral') return;
      const key = p.key.name ?? p.key.value;
      if (typeof key !== 'string' || !CSS_KEY_RE.test(key)) return;
      if (CSS_DECL_RE.test(p.value.value)) return;
      const container = path.parentPath?.parentPath;
      if (
        container?.node.type === 'JSXExpressionContainer' &&
        container.parent?.type === 'JSXAttribute' &&
        container.parent.name?.name === 'style'
      )
        return;
      scanStringValue(p.value.value, p.value, key, mk(enclosingName(path)));
    },

    'MemberExpression|OptionalMemberExpression'(path: any) {
      const n = path.node;
      const parent = path.parent;
      // Only the outermost link of a chain is reported, once.
      if (
        (parent.type === 'MemberExpression' ||
          parent.type === 'OptionalMemberExpression') &&
        parent.object === n
      )
        return;
      const props: string[] = [];
      let base = n;
      while (
        base.type === 'MemberExpression' ||
        base.type === 'OptionalMemberExpression'
      ) {
        props.unshift(base.computed ? '[]' : base.property.name);
        base = base.object;
      }
      if (base.type !== 'Identifier') return;
      let category: FindingCategory | undefined;
      // Any chain rooted at `theme` or `props.theme` is legacy-theme, with the
      // whole chain as raw (so `theme.colors.x` is legacy-theme, not colors).
      if (base.name === 'theme' && props.length >= 1) {
        category = 'legacy-theme';
      } else if (
        base.name === 'props' &&
        props[0] === 'theme' &&
        props.length >= 2
      ) {
        category = 'legacy-theme';
      } else if (legacyImports.has(base.name) && !ARRAY_METHODS.has(props[0])) {
        category = legacyImports.get(base.name);
      } else if (
        tokenApi.has(base.name) &&
        props.length >= 2 &&
        path.scope.getBinding(base.name)?.kind === 'module'
      ) {
        category = 'token-var';
      }
      if (!category) return;
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
      if (
        CSS_DECL_RE.test(n.value) &&
        path.parent.type !== 'ImportDeclaration' &&
        path.parent.type !== 'ExportNamedDeclaration' &&
        path.parent.type !== 'ExportAllDeclaration'
      ) {
        scanCssText(
          n.value,
          { line: n.loc!.start.line, col: n.loc!.start.column + 2 },
          tokens,
          mk(enclosingName(path))
        );
      }
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

  const sorted = findings.sort(
    (a, b) =>
      a.line - b.line ||
      a.col - b.col ||
      a.category.localeCompare(b.category) ||
      a.raw.localeCompare(b.raw)
  );
  return { findings: sorted };
};

/** Findings only; a file that does not parse yields []. Use scanFileResult to see the error. */
export const scanFile = (
  filePath: string,
  source: string,
  tokens: TokenMeta[]
): Finding[] => scanFileResult(filePath, source, tokens).findings;
