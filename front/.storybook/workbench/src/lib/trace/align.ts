// Places each entry of a componentStyle's `rules` (the template's own
// strings and functions, as styled-components 5.3.9 flattened them when the
// component was defined) in an indexed template, by exact equality: a
// non-empty quasi must equal its entry, and each expression consumes what
// its shape flattens to. An alignment counts only when it consumes every
// entry and is the only one; a template the rules could match two ways, or
// two templates that both align, are not guessed between.
import type { Alignment, Hop, Slot, Template } from './types';

export type TemplateGet = (id: string) => Template | undefined;

// Steps of the bounded search through `unknown` expressions.
const BUDGET = 20000;

const isFunction = (v: unknown) => typeof v === 'function';
const isString = (v: unknown): v is string => typeof v === 'string';

// The helper wrapper's `${css(style, ...args)}`, where the call site's
// template is inlined (media.*, styleUtils.ts:20-41).
const isSlotExpr = (t: Template, k: number) => {
  const e = t.exprs[k];
  return (
    e.shape !== 'fn' &&
    ((e.read.k === 'call' && e.read.callee === 'css') ||
      /^css\(/.test(e.text.trim()))
  );
};

export type AlignOutcome =
  | { ok: true; alignment: Alignment }
  | { ok: false; why: 'no-match' | 'ambiguous' | 'budget' };

type Cont = (i: number, slots: Slot[]) => boolean;

export const alignOutcome = (
  rules: unknown[],
  template: Template,
  get: TemplateGet
): AlignOutcome => {
  // 5.3.9 `Ce`: css() of a template with no holes returns its strings
  // array as it is (`0===n.length&&1===e.length&&"string"==typeof e[0]?e`).
  if (
    template.exprs.length === 0 &&
    rules.length === 1 &&
    rules[0] === template.quasis[0]
  ) {
    return {
      ok: true,
      alignment: {
        template,
        slots: [{ kind: 'quasi', template, k: 0, path: [] }],
      },
    };
  }

  const found: Slot[][] = [];
  let steps = 0;
  let exhausted = false;

  const walk = (
    t: Template,
    from: number,
    path: Hop[],
    slots: Slot[],
    then: Cont,
    slotFor?: string
  ): boolean => {
    const n = t.exprs.length;
    const step = (q: number, i: number, acc: Slot[]): boolean => {
      if (++steps > BUDGET) {
        exhausted = true;
        return true;
      }
      let at = i;
      let next = acc;
      const text = t.quasis[q];
      // `Ne` drops '' entries, so an empty quasi consumes nothing.
      if (text !== '') {
        if (rules[at] !== text) return false;
        next = [...acc, { kind: 'quasi', template: t, k: q, path }];
        at++;
      }
      if (q === n) return then(at, next);
      return expand(t, q, at, path, next, (j, s) => step(q + 1, j, s), slotFor);
    };
    return step(0, from, slots);
  };

  const expand = (
    t: Template,
    k: number,
    i: number,
    path: Hop[],
    slots: Slot[],
    then: Cont,
    slotFor?: string
  ): boolean => {
    const e = t.exprs[k];
    const slot: Slot = { kind: 'expr', template: t, k, path };
    const one = (test: (v: unknown) => boolean, s: Slot = slot) =>
      i < rules.length && test(rules[i]) && then(i + 1, [...slots, s]);
    const none = () => then(i, slots);
    const hop = [...path, { template: t, expr: k }];

    if (slotFor && isSlotExpr(t, k)) {
      const inner = get(slotFor);
      return !!inner && walk(inner, i, hop, slots, then);
    }
    switch (e.shape) {
      case 'fn':
        return one(isFunction, slotFor ? { ...slot, slot: slotFor } : slot);
      case 'value':
        // '' false null undefined flatten to '' and are dropped.
        if (e.value !== undefined) {
          return e.value === '' ? none() : one((v) => v === e.value);
        }
        return one(isString) || none();
      case 'component':
        return one((v) => isString(v) && v.startsWith('.sc-'));
      case 'css': {
        const inner = e.css ? get(e.css) : undefined;
        return !!inner && walk(inner, i, hop, slots, then);
      }
      case 'helper': {
        const wrapper = e.wrapper ? get(e.wrapper) : undefined;
        return !!wrapper && walk(wrapper, i, hop, slots, then, e.slot);
      }
      default:
        return one(isFunction) || one(isString) || none();
    }
  };

  walk(template, 0, [], [], (i, slots) => {
    if (i !== rules.length) return false;
    found.push(slots);
    return found.length > 1;
  });

  if (exhausted) return { ok: false, why: 'budget' };
  if (found.length > 1) return { ok: false, why: 'ambiguous' };
  if (found.length === 0) return { ok: false, why: 'no-match' };
  return { ok: true, alignment: { template, slots: found[0] } };
};

// The alignment of `rules` with `template`, or undefined when there is
// none or more than one.
export const alignRules = (
  rules: unknown[],
  template: Template,
  get: TemplateGet
): Alignment | undefined => {
  const r = alignOutcome(rules, template, get);
  return r.ok ? r.alignment : undefined;
};

// The template ids a template can reach while aligning or evaluating: its
// inlined css, its helpers' wrappers and call sites, and every template a
// read of its expressions names.
export const reachableIds = (t: Template): string[] => {
  const ids = new Set<string>();
  const visit = (r: unknown) => {
    if (!r || typeof r !== 'object') return;
    const read = r as { k?: string; id?: string };
    if (read.k === 'template' && read.id) ids.add(read.id);
    for (const v of Object.values(r)) {
      if (v && typeof v === 'object') visit(v);
    }
  };
  for (const e of t.exprs) {
    if (e.css) ids.add(e.css);
    if (e.wrapper) ids.add(e.wrapper);
    if (e.slot) ids.add(e.slot);
    visit(e.read);
  }
  return [...ids];
};

// Candidates for `rules`: the lookup's ids for each of its first 30 string
// entries, in order, each once.
export const LOOKUP_ENTRIES = 30;

// The lookup's list of the styled templates whose quasis are all blank
// (scripts/design-system/index BLANK_KEY): rules with no other key try them.
export const BLANK_KEY = 'blank';

export const lookupKeys = (rules: unknown[]): string[] =>
  rules.filter(isString).slice(0, LOOKUP_ENTRIES);
