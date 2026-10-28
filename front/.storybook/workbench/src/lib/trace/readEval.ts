// Evaluates an index Read with the context a template function ran with
// (the props, the theme), the way the code itself would: JS semantics for
// ||, && and ??, the branch a condition or switch takes, the table entry a
// map key picks. It answers the leaf that produced the value and the reads
// crossed to reach it. A read it cannot evaluate (a call the index has no
// body for, an unknown expression) stops it: the answer then says where,
// and whether that read is provably the value's producer.
import type { Read } from './types';

export type Context = Record<string, unknown>;

export type EvalPart = { start: number; end: number; result: EvalOk };

export type EvalOk = {
  ok: true;
  value: unknown;
  leaf: Read;
  // The reads crossed from the root to the leaf (the leaf excluded).
  via: Read[];
  // A concat leaf: where each part's text sits in the value.
  parts?: EvalPart[];
  // The last map crossed: the key it used, and every key whose entry is
  // the same read (compared by its place in the file).
  mapKey?: string;
  sharedBy?: string[];
};

export type EvalStuck = {
  ok: false;
  at: Read;
  via: Read[];
  // True when `at` is provably the value's producer (its value is the
  // result); false when it stands in a test or a key, or when it is an
  // `||` item whose truthiness decides between it and a later item.
  leafPosition: boolean;
  mapKey?: string;
  sharedBy?: string[];
};

export type EvalResult = EvalOk | EvalStuck;

type MapInfo = { mapKey?: string; sharedBy?: string[] };

const sameRead = (a: Read, b: Read) =>
  a.loc.start === b.loc.start && a.loc.end === b.loc.end;

// A literal is a string in the index even when the code wrote a number;
// comparing it with a number or a boolean would be a guess at its type.
const typedAgainst = (r: Read, other: unknown) =>
  r.k !== 'literal' ||
  typeof other === 'string' ||
  other === undefined ||
  other === null;

const stops = (k: 'or' | 'and' | 'nullish', v: unknown) =>
  k === 'or' ? !!v : k === 'and' ? !v : v !== null && v !== undefined;

// `expected`: the runtime value (String of it) the read produced, when
// known. It only decides which of two items an unevaluable `||` item
// stands between; every value is still computed from the code.
export const readEval = (
  read: Read,
  context: Context,
  expected?: string
): EvalResult => {
  const ok = (
    value: unknown,
    leaf: Read,
    via: Read[],
    extra: Partial<EvalOk> = {}
  ): EvalOk => ({ ok: true, value, leaf, via, ...extra });

  const stuck = (
    at: Read,
    via: Read[],
    leafPosition: boolean,
    map: MapInfo = {}
  ): EvalStuck => ({ ok: false, at, via, leafPosition, ...map });

  // A stuck read inside a test, a key or a part: the branch is unknown.
  const blind = (r: EvalStuck): EvalStuck => ({ ...r, leafPosition: false });

  const go = (
    r: Read,
    via: Read[],
    map: MapInfo,
    want: string | undefined
  ): EvalResult => {
    const here = [...via, r];
    switch (r.k) {
      case 'literal':
        return ok(r.value, r, via, map);
      case 'token':
        return ok(`var(${r.name})`, r, via, map);
      case 'theme': {
        let v: unknown = context.theme;
        for (const key of r.path) {
          v =
            v !== null && v !== undefined
              ? (v as Record<string, unknown>)[key]
              : undefined;
        }
        return ok(v, r, via, map);
      }
      case 'const':
        return r.value === undefined
          ? stuck(r, via, true, map)
          : ok(r.value, r, via, map);
      case 'prop':
        return ok(context[r.name], r, via, map);
      case 'or':
      case 'and':
      case 'nullish': {
        const chain = (i: number): EvalResult => {
          const item = go(r.items[i], here, map, want);
          const last = i === r.items.length - 1;
          if (item.ok)
            return last || stops(r.k, item.value) ? item : chain(i + 1);
          if (!item.leafPosition || last) return item;
          // The item is either the result or falls through to the rest:
          // it is the result when the rest cannot have produced the value.
          if (want === undefined) return blind(item);
          const rest = chain(i + 1);
          return rest.ok && String(rest.value) !== want ? item : blind(item);
        };
        return r.items.length ? chain(0) : stuck(r, via, true, map);
      }
      case 'cond': {
        const test = go(r.test, here, {}, undefined);
        if (!test.ok) return blind(test);
        return go(test.value ? r.then : r.else, here, map, want);
      }
      case 'switch': {
        const on = go(r.on, here, {}, undefined);
        if (!on.ok) return blind(on);
        const v = on.value;
        // Case values are strings in the index: a number or a boolean
        // cannot be matched against them without guessing their type.
        if (v !== undefined && v !== null && typeof v !== 'string') {
          return stuck(r.on, here, false);
        }
        const hit = r.cases.find((c) => c.value === v);
        if (hit) return go(hit.then, here, map, want);
        return r.default
          ? go(r.default, here, map, want)
          : ok(undefined, r, via, map);
      }
      case 'eq':
      case 'neq': {
        if (!r.right) return stuck(r, via, true, map);
        const left = go(r.left, here, {}, undefined);
        if (!left.ok) return blind(left);
        const right = go(r.right, here, {}, undefined);
        if (!right.ok) return blind(right);
        if (
          !typedAgainst(r.left, right.value) ||
          !typedAgainst(r.right, left.value)
        ) {
          return stuck(r, via, false);
        }
        const same = left.value === right.value;
        return ok(r.k === 'eq' ? same : !same, r, via, map);
      }
      case 'not': {
        const left = go(r.left, here, {}, undefined);
        if (!left.ok) return blind(left);
        return ok(!left.value, r, via, map);
      }
      case 'concat': {
        // A concat is a leaf: it builds its value from its parts.
        const parts: EvalPart[] = [];
        let text = '';
        for (const part of r.parts) {
          const p = go(part, here, {}, undefined);
          if (!p.ok) return stuck(r, via, true, map);
          const s = String(p.value);
          parts.push({
            start: text.length,
            end: text.length + s.length,
            result: p,
          });
          text += s;
        }
        return ok(text, r, via, { ...map, parts });
      }
      case 'map': {
        const key = go(r.key, here, {}, undefined);
        if (!key.ok) return blind(key);
        const k = String(key.value);
        const entry = Object.prototype.hasOwnProperty.call(r.table, k)
          ? r.table[k]
          : undefined;
        // lodash get on a key without the field gives undefined.
        if (!entry) return ok(undefined, r, via, map);
        const sharedBy = Object.keys(r.table).filter((other) =>
          sameRead(r.table[other], entry)
        );
        return go(entry, here, { mapKey: k, sharedBy }, want);
      }
      case 'call':
        return r.returns
          ? go(r.returns, here, map, want)
          : stuck(r, via, true, map);
      case 'template':
      case 'unknown':
        return stuck(r, via, true, map);
    }
  };

  return go(read, [], {}, expected);
};

// The result for the characters [start, end) of a value: the value itself,
// or one part of a concat leaf, recursively. Undefined when the range
// crosses parts or falls inside a part that is not a concat.
export const drill = (
  r: EvalOk,
  start: number,
  end: number
): EvalOk | undefined => {
  const text = String(r.value);
  if (start === 0 && end === text.length) return r;
  const part = r.parts?.find((p) => p.start <= start && end <= p.end);
  return part && drill(part.result, start - part.start, end - part.start);
};
