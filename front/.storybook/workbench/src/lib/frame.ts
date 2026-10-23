// The canvas is Storybook's preview frame on the same origin, so the shell
// reaches into its document directly: token overrides go on the root
// element's inline style, the mode on its data-gv-mode attribute, and the
// Tokens panel reads the rendered DOM.
import type { Mode, TokenName } from '@ds/tokens/tokens';

import type { TokenMeta } from './data';
import type { Overrides } from './overrides';

export const MODE_ATTRIBUTE = 'data-gv-mode';

const PREFIX = '--gv-';

const inlineTokens = (doc: Document): string[] => {
  const style = doc.documentElement.style;
  const names: string[] = [];
  for (let i = 0; i < style.length; i++) {
    if (style[i].startsWith(PREFIX)) names.push(style[i]);
  }
  return names;
};

// Removes every --gv-* override from the frame's root element.
export const clear = (doc: Document) => {
  const style = doc.documentElement.style;
  inlineTokens(doc).forEach((name) => style.removeProperty(name));
};

// Puts exactly `o` on the root element (overrides no longer in `o` are
// removed) and, when given, the mode: `redesign` sets the attribute, `today`
// removes it (today's values live on :root).
export const applyToDocument = (doc: Document, o: Overrides, mode?: Mode) => {
  const root = doc.documentElement;
  inlineTokens(doc)
    .filter((name) => !(name in o))
    .forEach((name) => root.style.removeProperty(name));
  for (const [name, value] of Object.entries(o)) {
    if (name.startsWith(PREFIX) && typeof value === 'string') {
      root.style.setProperty(name, value);
    }
  }
  if (mode === 'redesign') root.setAttribute(MODE_ATTRIBUTE, 'redesign');
  else if (mode === 'today') root.removeAttribute(MODE_ATTRIBUTE);
};

export type FrameGlobals = { mode: Mode; city: string; lang: string };

// The preview frame URL of a story, relative to the shell at
// <storybook>/workbench/. The globals are the ones .storybook/preview.tsx
// declares (the language global is called `lang` there).
export const storyUrl = (storyId: string, globals: FrameGlobals): string => {
  const g = (Object.keys(globals) as (keyof FrameGlobals)[])
    .map((k) => `${k}:${encodeURIComponent(globals[k])}`)
    .join(';');
  return `../iframe.html?id=${encodeURIComponent(
    storyId
  )}&viewMode=story&globals=${g}`;
};

// ------------------------------------------------------------ token reading

export type TokenMatch = {
  name: TokenName;
  matches: 'linked' | 'equal' | 'none';
};

// Computed properties read per element, by the token category they match.
const PROPERTIES: Record<string, string[]> = {
  radius: [
    'border-top-left-radius',
    'border-top-right-radius',
    'border-bottom-right-radius',
    'border-bottom-left-radius',
  ],
  space: [
    'padding-top',
    'padding-right',
    'padding-bottom',
    'padding-left',
    'margin-top',
    'margin-right',
    'margin-bottom',
    'margin-left',
  ],
  color: ['color', 'background-color'],
  'font-size': ['font-size'],
  shadow: ['box-shadow'],
};

// The property a token's value is resolved through, so the browser writes
// it in the same form as getComputedStyle does for elements.
const probeProperty = (t: TokenMeta): [string, string] | null => {
  if (t.category === 'radius') return ['radius', 'border-top-left-radius'];
  if (t.category === 'space') return ['space', 'padding-top'];
  if (t.category === 'color') return ['color', 'color'];
  if (t.category === 'shadow') return ['shadow', 'box-shadow'];
  if (
    (t.category === 'font' || t.category === 'text') &&
    /(^--gv-fs-|-size$)/.test(t.name)
  ) {
    return ['font-size', 'font-size'];
  }
  return null;
};

// Fallbacks no token uses, to spot a token that is not defined.
const SENTINEL: Record<string, string> = {
  'border-top-left-radius': '12345px',
  'padding-top': '12345px',
  'font-size': '12345px',
  color: 'rgb(123, 45, 1)',
  'box-shadow': 'rgb(123, 45, 1) 12345px 0px 0px 0px',
};

// Values that say nothing about token use.
const NEUTRAL = new Set(['', '0px', 'none', 'rgba(0, 0, 0, 0)', 'normal']);

// Work caps: the DOM of a story is small, but a page story may not be.
export const MAX_ELEMENTS = 3000;
export const MAX_RULES = 20000;

const VAR = /var\(\s*(--gv-[\w-]+)/g;
// Pseudo-elements and user-action states: a rule for `.btn:hover` still
// shows which tokens `.btn` consumes.
const STATE =
  /::?(before|after|placeholder|selection|marker|hover|focus-visible|focus-within|focus|active|visited)\b/g;

type TokenRule = { selector: string; names: string[] };

const tokenRules = (doc: Document): TokenRule[] => {
  const out: TokenRule[] = [];
  let seen = 0;
  const walk = (rules: CSSRuleList) => {
    for (let i = 0; i < rules.length && seen < MAX_RULES; i++) {
      seen++;
      const rule = rules[i] as CSSStyleRule & { cssRules?: CSSRuleList };
      if (rule.selectorText !== undefined) {
        const text = rule.style?.cssText ?? '';
        const names = [...text.matchAll(VAR)].map((m) => m[1]);
        if (names.length) out.push({ selector: rule.selectorText, names });
      }
      // @media, @supports and nested rules.
      if (rule.cssRules) walk(rule.cssRules);
    }
  };
  for (const sheet of Array.from(doc.styleSheets)) {
    try {
      walk(sheet.cssRules);
    } catch {
      // A cross-origin sheet throws SecurityError on cssRules; skip it.
    }
  }
  return out;
};

// Whether the rule's selector hits `root` or an element under it. States
// are stripped first (`.btn:hover` counts for `.btn`; the query would miss
// it, or throw for a pseudo-element), then the selector is tried as written
// when stripping broke it.
const inSubtree = (root: Element, selector: string) => {
  const hit = (sel: string) => root.matches(sel) || !!root.querySelector(sel);
  try {
    return hit(selector.replace(STATE, '') || '*');
  } catch {
    try {
      return hit(selector);
    } catch {
      return false;
    }
  }
};

const storyRoot = (doc: Document): Element =>
  doc.querySelector('#storybook-root') ??
  doc.querySelector('#storybook-docs') ??
  doc.body;

// Which tokens the rendered story consumes. `linked`: a style rule that
// applies to an element of the story (or its inline style) names the token
// in var(). `equal`: no such rule, but a computed value of a matching
// property equals the token's active value (a hard-coded value that happens
// to match). Every token of `meta` is listed, in order. `scope` limits the
// read to one element and its subtree (one component instance on a
// platform page, for ds:audit); by default it is the story root.
export const readComputedTokens = (
  doc: Document,
  meta: TokenMeta[],
  scope?: Element
): TokenMatch[] => {
  const win = doc.defaultView;
  const root = scope ?? storyRoot(doc);
  if (!win || !root) {
    return meta.map((t) => ({ name: t.name as TokenName, matches: 'none' }));
  }
  const elements = [root, ...Array.from(root.querySelectorAll('*'))].slice(
    0,
    MAX_ELEMENTS
  );

  // Active values, resolved by the browser through a hidden probe.
  const probe = doc.createElement('div');
  probe.style.cssText =
    'position:absolute;visibility:hidden;pointer-events:none';
  doc.body.appendChild(probe);
  const byValue = new Map<string, Set<string>>(); // `${group}|${value}` -> names
  try {
    for (const t of meta) {
      const p = probeProperty(t);
      if (!p) continue;
      // A token the active mode does not define resolves to the fallback,
      // not to the inherited value, and is skipped.
      const sentinel = SENTINEL[p[1]];
      probe.style.setProperty(p[1], `var(${t.name}, ${sentinel})`);
      const value = win.getComputedStyle(probe).getPropertyValue(p[1]).trim();
      probe.style.removeProperty(p[1]);
      if (NEUTRAL.has(value) || value === sentinel) continue;
      const key = `${p[0]}|${value}`;
      if (!byValue.has(key)) byValue.set(key, new Set());
      byValue.get(key)?.add(t.name);
    }
  } finally {
    probe.remove();
  }

  const equal = new Set<string>();
  for (const el of elements) {
    const cs = win.getComputedStyle(el);
    for (const [group, props] of Object.entries(PROPERTIES)) {
      for (const prop of props) {
        const value = cs.getPropertyValue(prop).trim();
        if (NEUTRAL.has(value)) continue;
        byValue.get(`${group}|${value}`)?.forEach((n) => equal.add(n));
      }
    }
  }

  const linked = new Set<string>();
  for (const el of elements) {
    const inline = el.getAttribute('style') ?? '';
    for (const m of inline.matchAll(VAR)) linked.add(m[1]);
  }
  // One subtree query per rule, not one matches() per element and rule.
  for (const rule of tokenRules(doc)) {
    if (rule.names.every((n) => linked.has(n))) continue;
    if (inSubtree(root, rule.selector)) {
      rule.names.forEach((n) => linked.add(n));
    }
  }

  return meta.map((t) => ({
    name: t.name as TokenName,
    matches: linked.has(t.name)
      ? 'linked'
      : equal.has(t.name)
      ? 'equal'
      : 'none',
  }));
};
