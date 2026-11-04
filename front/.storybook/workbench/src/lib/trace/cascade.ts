// Which CSS rule wins a longhand on the element, as DevTools' Computed tab
// shows it: the rules of the frame's CSSOM that match the element (media
// through the frame's matchMedia, supports through CSS.supports, cascade
// layers), ordered by importance, inline style, layer, specificity and
// order; an inherited property with no rule of its own comes from the
// nearest ancestor that sets it. Selector text is never compared here:
// the browser matches (el.matches) and serializes it.
import { atPath, FAMILY } from '../inspect';

import type { SheetKind } from './types';

// ------------------------------------------------------------ selectors

// Splits a selector list on its top-level commas (not inside parentheses,
// brackets or strings).
export const splitSelectors = (text: string): string[] => {
  const out: string[] = [];
  let depth = 0;
  let quote = '';
  let start = 0;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quote) {
      if (c === '\\') i++;
      else if (c === quote) quote = '';
    } else if (c === '\\') i++;
    else if (c === '"' || c === "'") quote = c;
    else if (c === '(' || c === '[') depth++;
    else if (c === ')' || c === ']') depth = Math.max(0, depth - 1);
    else if (c === ',' && depth === 0) {
      out.push(text.slice(start, i).trim());
      start = i + 1;
    }
  }
  out.push(text.slice(start).trim());
  return out.filter(Boolean);
};

export type Specificity = [number, number, number];

const ZERO: Specificity = [0, 0, 0];

export const compareSpecificity = (x: Specificity, y: Specificity) =>
  x[0] - y[0] || x[1] - y[1] || x[2] - y[2];

const add = (x: Specificity, y: Specificity): Specificity => [
  x[0] + y[0],
  x[1] + y[1],
  x[2] + y[2],
];

const maxOf = (list: string): Specificity =>
  splitSelectors(list)
    .map(specificity)
    .reduce((m, s) => (compareSpecificity(s, m) > 0 ? s : m), ZERO);

const LEGACY_ELEMENTS = new Set([
  'before',
  'after',
  'first-line',
  'first-letter',
]);
const MOST_SPECIFIC_ARGUMENT = new Set([
  'is',
  'not',
  'has',
  'matches',
  '-webkit-any',
  '-moz-any',
]);
const IDENT = /^(?:\\[\s\S]|[\w\u00a0-\uffff-])+/;

// The text inside the parentheses that open at `open`, and the index after
// the closing one.
const argumentAt = (s: string, open: number): [string, number] => {
  let depth = 0;
  let quote = '';
  for (let i = open; i < s.length; i++) {
    const c = s[i];
    if (quote) {
      if (c === '\\') i++;
      else if (c === quote) quote = '';
    } else if (c === '\\') i++;
    else if (c === '"' || c === "'") quote = c;
    else if (c === '(') depth++;
    else if (c === ')' && --depth === 0) return [s.slice(open + 1, i), i + 1];
  }
  return [s.slice(open + 1), s.length];
};

// Selectors 4 specificity (a, b, c) of one complex selector: ids; classes,
// attributes and pseudo-classes; types and pseudo-elements. :is(), :not()
// and :has() count as their most specific argument, :where() as zero,
// :nth-child(An+B of S) as a pseudo-class plus S.
export const specificity = (selector: string): Specificity => {
  let s: Specificity = [0, 0, 0];
  const text = selector.trim();
  let i = 0;
  while (i < text.length) {
    const c = text[i];
    if (c === '#') {
      const m = IDENT.exec(text.slice(i + 1));
      s = add(s, [1, 0, 0]);
      i += 1 + (m ? m[0].length : 0);
    } else if (c === '.') {
      const m = IDENT.exec(text.slice(i + 1));
      s = add(s, [0, 1, 0]);
      i += 1 + (m ? m[0].length : 0);
    } else if (c === '[') {
      let quote = '';
      let j = i + 1;
      for (; j < text.length; j++) {
        const d = text[j];
        if (quote) {
          if (d === '\\') j++;
          else if (d === quote) quote = '';
        } else if (d === '"' || d === "'") quote = d;
        else if (d === ']') break;
      }
      s = add(s, [0, 1, 0]);
      i = j + 1;
    } else if (c === ':') {
      const element = text[i + 1] === ':';
      const at = i + (element ? 2 : 1);
      const m = IDENT.exec(text.slice(at));
      const name = (m ? m[0] : '').toLowerCase();
      let next = at + name.length;
      let arg: string | undefined;
      if (text[next] === '(') [arg, next] = argumentAt(text, next);
      if (element || LEGACY_ELEMENTS.has(name)) {
        s = add(s, [0, 0, 1]);
        if (name === 'slotted' && arg) s = add(s, maxOf(arg));
      } else if (name === 'where') {
        // zero
      } else if (MOST_SPECIFIC_ARGUMENT.has(name)) {
        s = add(s, arg ? maxOf(arg) : ZERO);
      } else if (
        (name === 'nth-child' || name === 'nth-last-child') &&
        arg &&
        /\sof\s/i.test(arg)
      ) {
        s = add(s, add([0, 1, 0], maxOf(arg.split(/\sof\s/i)[1])));
      } else if ((name === 'host' || name === 'host-context') && arg) {
        s = add(s, add([0, 1, 0], maxOf(arg)));
      } else {
        s = add(s, [0, 1, 0]);
      }
      i = next;
    } else if (c === '*') {
      i++;
    } else if (/[\s>+~|]/.test(c)) {
      i++;
    } else {
      const m = IDENT.exec(text.slice(i));
      if (m) {
        // `ns|type` counts once, for the type.
        if (text[i + m[0].length] !== '|') s = add(s, [0, 0, 1]);
        i += m[0].length;
      } else {
        i++;
      }
    }
  }
  return s;
};

// A part with a pseudo-element never styles the element itself.
export const hasPseudoElement = (part: string) =>
  /::|:(before|after|first-line|first-letter)\b/i.test(part);

// ------------------------------------------------------------ pseudo-states

// storybook-addon-pseudo-states rewrites a rule with `:hover` (and the like)
// in place: each original part is followed by its rewrites, which carry a
// `.pseudo-<state>` or `.pseudo-<state>-all` class
// (node_modules/storybook-addon-pseudo-states rewriteRule). The original
// parts are the ones without `.pseudo-`.
export const PSEUDO_MARK = '.pseudo-';

export const originalSelector = (selectorText: string): string =>
  splitSelectors(selectorText)
    .filter((p) => !p.includes(PSEUDO_MARK))
    .join(', ');

// The original part a matched part came from: itself, or the nearest
// original before it.
export const originalPart = (selectorText: string, part: string): string => {
  const parts = splitSelectors(selectorText);
  let original = part;
  for (const p of parts) {
    if (!p.includes(PSEUDO_MARK)) original = p;
    if (p === part) return p.includes(PSEUDO_MARK) ? original : p;
  }
  return part;
};

// ------------------------------------------------------------ sheets

// `styled` when styled-components owns the sheet; `storybook` for
// Storybook's own preview styles (its addons' style elements, its
// `sb-*` asset folders); else `global`, with the sheet's href.
export const sheetKind = (sheet: CSSStyleSheet): SheetKind => {
  let top: CSSStyleSheet = sheet;
  while (top.parentStyleSheet) top = top.parentStyleSheet;
  const node = top.ownerNode as Element | null;
  if (node?.hasAttribute?.('data-styled')) return 'styled';
  const id = node?.getAttribute?.('id') ?? '';
  if (
    /^(addon-|sb-|storybook)/i.test(id) ||
    node?.hasAttribute?.('data-highlight') ||
    /\/sb-[\w-]+\//.test(sheet.href ?? '')
  ) {
    return 'storybook';
  }
  return 'global';
};

// ------------------------------------------------------------ matching

export type MatchedRule = {
  rule: CSSStyleRule;
  // The selector part that matched, the most specific one.
  part: string;
  specificity: Specificity;
  order: number;
  // Grouping rules around it, outermost first: '@media <conditionText>'.
  atRules: string[];
  // Its cascade layer's place in layer order; undefined when unlayered.
  layer?: number;
  sheet: CSSStyleSheet;
};

type Ctor = abstract new (...args: never[]) => unknown;

const isA = (frame: Window, rule: unknown, name: string): boolean => {
  const C = (frame as unknown as Record<string, unknown>)[name];
  return typeof C === 'function' && rule instanceof (C as Ctor);
};

const conditionOf = (rule: CSSRule): string =>
  (rule as CSSConditionRule).conditionText ??
  (rule as CSSMediaRule).media?.mediaText ??
  '';

// Every style rule of the frame that matches the element, in cascade order
// of appearance. Rules a script cannot read (another origin) are skipped.
export const collectRules = (frame: Window, el: Element): MatchedRule[] => {
  const out: MatchedRule[] = [];
  const layers: string[] = [];
  let order = 0;
  const layerRank = (name: string) => {
    if (!layers.includes(name)) layers.push(name);
    return layers.indexOf(name);
  };

  const walk = (
    list: CSSRuleList,
    sheet: CSSStyleSheet,
    atRules: string[],
    layer: string | undefined
  ) => {
    for (const rule of Array.from(list)) {
      if (isA(frame, rule, 'CSSStyleRule')) {
        const style = rule as CSSStyleRule;
        order++;
        let best: { part: string; specificity: Specificity } | undefined;
        for (const part of splitSelectors(style.selectorText)) {
          if (hasPseudoElement(part)) continue;
          let matches = false;
          try {
            matches = el.matches(part);
          } catch {
            matches = false;
          }
          if (!matches) continue;
          const sp = specificity(part);
          if (!best || compareSpecificity(sp, best.specificity) > 0) {
            best = { part, specificity: sp };
          }
        }
        if (best) {
          out.push({
            rule: style,
            ...best,
            order,
            atRules,
            layer: layer === undefined ? undefined : layerRank(layer),
            sheet,
          });
        }
      } else if (isA(frame, rule, 'CSSMediaRule')) {
        const text = conditionOf(rule);
        if (frame.matchMedia(text).matches) {
          walk(
            (rule as CSSMediaRule).cssRules,
            sheet,
            [...atRules, `@media ${text}`],
            layer
          );
        }
      } else if (isA(frame, rule, 'CSSSupportsRule')) {
        const text = conditionOf(rule);
        const css = (frame as unknown as { CSS?: typeof CSS }).CSS;
        if (css?.supports(text)) {
          walk(
            (rule as CSSSupportsRule).cssRules,
            sheet,
            [...atRules, `@supports ${text}`],
            layer
          );
        }
      } else if (isA(frame, rule, 'CSSLayerBlockRule')) {
        const name = (rule as CSSLayerBlockRule).name;
        const full = layer ? `${layer}.${name}` : name;
        layerRank(full);
        walk((rule as CSSLayerBlockRule).cssRules, sheet, atRules, full);
      } else if (isA(frame, rule, 'CSSLayerStatementRule')) {
        for (const name of (rule as CSSLayerStatementRule).nameList) {
          layerRank(layer ? `${layer}.${name}` : name);
        }
      } else if (isA(frame, rule, 'CSSImportRule')) {
        const imported = rule as CSSImportRule;
        const media = imported.media?.mediaText ?? '';
        if (
          imported.styleSheet &&
          (!media || frame.matchMedia(media).matches)
        ) {
          walkSheet(imported.styleSheet, atRules);
        }
      }
      // Keyframes, font-face, page and the rest never style the element.
    }
  };

  const walkSheet = (sheet: CSSStyleSheet, atRules: string[]) => {
    if (sheet.disabled) return;
    const media = sheet.media?.mediaText ?? '';
    if (media && !frame.matchMedia(media).matches) return;
    let rules: CSSRuleList;
    try {
      rules = sheet.cssRules;
    } catch {
      return;
    }
    walk(rules, sheet, atRules, undefined);
  };

  const doc = frame.document;
  for (const sheet of Array.from(doc.styleSheets)) walkSheet(sheet, []);
  for (const sheet of doc.adoptedStyleSheets ?? []) walkSheet(sheet, []);
  return out;
};

// ------------------------------------------------------------ the winner

// The declarations that can set a longhand: FAMILY's list (lib/inspect.ts),
// the hyphen prefixes of its name (margin for margin-top, border-top and
// border for border-top-color) and the box shorthands FAMILY does not list.
// A name in this list sets the longhand only when the browser's own
// expansion of it says so (`expands`).
const EXTRA: Record<string, string[]> = {
  top: ['inset', 'inset-block', 'inset-block-start'],
  bottom: ['inset', 'inset-block', 'inset-block-end'],
  left: ['inset', 'inset-inline', 'inset-inline-start'],
  right: ['inset', 'inset-inline', 'inset-inline-end'],
  'align-items': ['place-items'],
  'justify-items': ['place-items'],
  'align-content': ['place-content'],
  'justify-content': ['place-content'],
  'align-self': ['place-self'],
  'justify-self': ['place-self'],
};
for (const side of ['top', 'right', 'bottom', 'left']) {
  for (const part of ['width', 'style', 'color']) {
    EXTRA[`border-${side}-${part}`] = [`border-${part}`];
  }
  const axis = side === 'top' || side === 'bottom' ? 'block' : 'inline';
  const end = side === 'top' || side === 'left' ? 'start' : 'end';
  EXTRA[`margin-${side}`] = [`margin-${axis}`, `margin-${axis}-${end}`];
}

export const familyOf = (longhand: string): string[] => {
  const prefixes: string[] = [];
  const bits = longhand.split('-');
  for (let n = bits.length - 1; n > 0; n--) {
    prefixes.push(bits.slice(0, n).join('-'));
  }
  return [
    ...new Set([
      longhand,
      ...(FAMILY[longhand] ?? []),
      ...prefixes,
      ...(EXTRA[longhand] ?? []),
    ]),
  ].filter(Boolean);
};

// Whether the declaration `prop: value` sets the longhand, by the browser's
// own expansion of it.
export type Expands = (
  prop: string,
  value: string,
  longhand: string
) => boolean;

export type Declared = {
  // The property declared: the longhand, or the shorthand that set it.
  prop: string;
  // Its value as the CSSOM serializes it.
  value: string;
  important: boolean;
};

// What a style declaration sets for the longhand: its own value, or a
// shorthand's when the shorthand holds var() (the longhands are then
// empty in CSSOM, pending substitution).
export const declaredIn = (
  style: CSSStyleDeclaration,
  longhand: string,
  expands: Expands
): Declared | undefined => {
  const own = style.getPropertyValue(longhand);
  if (own) {
    return {
      prop: longhand,
      value: own,
      important: style.getPropertyPriority(longhand) === 'important',
    };
  }
  for (const name of familyOf(longhand)) {
    if (name === longhand) continue;
    const value = style.getPropertyValue(name);
    if (value && expands(name, value, longhand)) {
      return {
        prop: name,
        value,
        important: style.getPropertyPriority(name) === 'important',
      };
    }
  }
  return undefined;
};

// The workbench's own paint: per edit id, the inline values an element edit
// set (lib/elementEdits.ts applyElementEdits, `applied`). True when an edit
// of the story on the canvas painted the longhand on this element.
export type Painted = (el: Element, longhand: string) => boolean;

export const paintedBy =
  (applied: Map<string, Map<string, string>>, storyId: string): Painted =>
  (el, longhand) => {
    for (const [id, originals] of applied) {
      if (!originals.has(longhand)) continue;
      const [story, pathText] = id.split('|');
      if (story !== storyId || pathText === undefined || pathText === 'file') {
        continue;
      }
      const path = pathText ? pathText.split('.').map(Number) : [];
      if (atPath(el.ownerDocument, path) === el) return true;
    }
    return false;
  };

export const INHERITED = new Set([
  'color',
  'font-family',
  'font-size',
  'font-style',
  'font-weight',
  'line-height',
  'letter-spacing',
  'text-align',
  'text-transform',
  'white-space',
  'word-spacing',
  'visibility',
  'cursor',
  'direction',
]);

export type Winner =
  | { kind: 'rule'; matched: MatchedRule; declared: Declared }
  | { kind: 'inline'; declared: Declared; painted: boolean }
  | { kind: 'none' };

// The rule (or inline style) whose declaration of the longhand wins:
// important before normal; for each, the inline style before any rule;
// then cascade layers (for normal declarations a later layer wins and
// unlayered rules win over layered ones; for important ones the reverse),
// specificity, and order of appearance.
export const winnerOf = (
  el: Element,
  longhand: string,
  matched: MatchedRule[],
  expands: Expands,
  painted: Painted = () => false
): Winner => {
  const candidates: { m: MatchedRule; d: Declared }[] = [];
  for (const m of matched) {
    const d = declaredIn(m.rule.style, longhand, expands);
    if (d) candidates.push({ m, d });
  }
  const style = (el as HTMLElement).style as CSSStyleDeclaration | undefined;
  const inline = style ? declaredIn(style, longhand, expands) : undefined;
  const layerKey = (m: MatchedRule, important: boolean) => {
    const rank = m.layer ?? Number.MAX_SAFE_INTEGER;
    return important ? -rank : rank;
  };
  candidates.sort(
    (x, y) =>
      Number(x.d.important) - Number(y.d.important) ||
      layerKey(x.m, x.d.important) - layerKey(y.m, y.d.important) ||
      compareSpecificity(x.m.specificity, y.m.specificity) ||
      x.m.order - y.m.order
  );
  const best = candidates[candidates.length - 1];
  if (inline && (inline.important || !best?.d.important)) {
    return { kind: 'inline', declared: inline, painted: painted(el, longhand) };
  }
  return best
    ? { kind: 'rule', matched: best.m, declared: best.d }
    : { kind: 'none' };
};
