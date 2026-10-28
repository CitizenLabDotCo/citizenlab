// The styled component a winning rule belongs to. The rule's selector
// carries the class its componentStyle generated (`.dXZzWh .sc-jsMahE` for
// the Button's Container); the element that has the class is the owner;
// its styled components and their base styles are the candidates, and the
// one is found by running it: the class name 5.3.9 generates from the
// result must equal the rule's class. So the owner is never picked by
// position alone, and a context that renders other CSS fails instead of
// tracing it.
import { splitSelectors } from './cascade';
import { namesOf } from './evaluate';
import {
  ComponentStyle,
  componentStyles,
  Context,
  execContext,
  Fiber,
  fiberOf,
  styledFibers,
  styledTypeOf,
} from './internals';

// A class in a selector (escapes kept).
const CLASS = /\.((?:\\[\s\S]|[\w\u00a0-\uffff-])+)/g;

const unescape = (s: string) => s.replace(/\\([\s\S])/g, '$1');

const classesIn = (selector: string) =>
  [...selector.matchAll(CLASS)].map((m) => unescape(m[1]));

// The leading compound of a selector: up to its first combinator.
export const leadingCompound = (selector: string) => {
  let depth = 0;
  for (let i = 0; i < selector.length; i++) {
    const c = selector[i];
    if (c === '\\') i++;
    else if (c === '(' || c === '[') depth++;
    else if (c === ')' || c === ']') depth--;
    else if (depth === 0 && /[\s>+~]/.test(c)) return selector.slice(0, i);
  }
  return selector;
};

const cache = new WeakMap<Document, { count: number; set: Set<string> }>();

const styledSheets = (doc: Document) =>
  Array.from(doc.styleSheets).filter((s) =>
    (s.ownerNode as Element | null)?.hasAttribute?.('data-styled')
  );

const rulesOf = (sheet: CSSStyleSheet): CSSRule[] => {
  try {
    return Array.from(sheet.cssRules);
  } catch {
    return [];
  }
};

// G: the first class of each selector's leading compound, over the
// styled-components sheets. Collected once per change of those sheets.
export const generatedClasses = (doc: Document): Set<string> => {
  const sheets = styledSheets(doc);
  const count = sheets.reduce((n, s) => n + rulesOf(s).length, 0);
  const known = cache.get(doc);
  if (known && known.count === count) return known.set;
  const set = new Set<string>();
  const walk = (rules: CSSRule[]) => {
    for (const rule of rules) {
      const text = (rule as CSSStyleRule).selectorText;
      if (typeof text === 'string') {
        for (const part of splitSelectors(text)) {
          const first = classesIn(leadingCompound(part))[0];
          if (first) set.add(first);
        }
      }
      const inner = (rule as CSSGroupingRule).cssRules;
      if (inner) walk(Array.from(inner));
    }
  };
  for (const s of sheets) walk(rulesOf(s));
  cache.set(doc, { count, set });
  return set;
};

// The rule's generated class: its leading compound's first class when that
// is in G, else the first class of the selector that is.
export const ownerClass = (
  selector: string,
  g: Set<string>
): string | undefined => {
  const lead = classesIn(leadingCompound(selector))[0];
  if (lead && g.has(lead)) return lead;
  return classesIn(selector).find((c) => g.has(c));
};

// The element itself or the nearest ancestor with the class.
export const ownerElement = (
  el: Element,
  name: string
): Element | undefined => {
  for (let at: Element | null = el; at; at = at.parentElement) {
    if (at.classList.contains(name)) return at;
  }
  return undefined;
};

// 5.3.9 writes className as concat(foldedComponentIds, styledComponentId,
// generatedClassName, props.className, attrs.className), the base styles'
// names first: the element's `sc-` ids and its classes in G, in order,
// pair up. The pairing only orders the candidates; the generated name
// decides.
export const pairIds = (el: Element, g: Set<string>): Map<string, string> => {
  const ids = [...el.classList].filter((c) => c.startsWith('sc-'));
  const names = [...el.classList].filter((c) => g.has(c));
  const out = new Map<string, string>();
  if (ids.length === names.length)
    ids.forEach((id, i) => out.set(names[i], id));
  return out;
};

export type Owner = {
  element: Element;
  fiber: Fiber;
  // The componentStyle whose generated class the rule carries.
  style: ComponentStyle;
  context: Context;
  name: string;
};

export type OwnerResult =
  | { ok: true; owner: Owner }
  | { ok: false; why: 'no-fiber' | 'no-owner' };

// The (fiber, componentStyle) whose run with the fiber's context generates
// `name`, among the styled components that render the element.
export const resolveOwner = (
  element: Element,
  name: string,
  g: Set<string>
): OwnerResult => {
  if (!fiberOf(element)) return { ok: false, why: 'no-fiber' };
  const ids = new Set(
    [...element.classList].filter((c) => c.startsWith('sc-'))
  );
  const candidates: { fiber: Fiber; style: ComponentStyle }[] = [];
  for (const fiber of styledFibers(element)) {
    const own = styledTypeOf(fiber)?.styledComponentId;
    if (!own || !ids.has(own)) continue;
    for (const style of componentStyles(fiber))
      candidates.push({ fiber, style });
  }
  if (!candidates.length) return { ok: false, why: 'no-fiber' };
  const paired = pairIds(element, g).get(name);
  candidates.sort(
    (x, y) =>
      Number(y.style.componentId === paired) -
      Number(x.style.componentId === paired)
  );
  for (const { fiber, style } of candidates) {
    const context = execContext(fiber);
    if (!context) continue;
    let names: string[];
    try {
      names = namesOf(style, context);
    } catch {
      continue;
    }
    if (names.includes(name)) {
      return { ok: true, owner: { element, fiber, style, context, name } };
    }
  }
  return { ok: false, why: 'no-owner' };
};
