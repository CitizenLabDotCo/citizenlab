// Arrow keys on a value field, as Figma steps its fields: ArrowUp adds 1,
// ArrowDown takes 1, with Shift by 10. The unit stays. In a composite value
// (a shadow, a border) the number at the caret moves, else the first one;
// numbers inside a function (rgba(), var()) and hex colours never do. Em and
// rem step by 0.01 (Shift 0.1), as a unitless line height does.

export const stepOfKey = (e: { key: string; shiftKey: boolean }): number => {
  if (e.key === 'ArrowUp') return e.shiftKey ? 10 : 1;
  if (e.key === 'ArrowDown') return e.shiftKey ? -10 : -1;
  return 0;
};

// Drops float noise (0.1 + 0.2), keeps up to 4 decimals.
const clean = (n: number) => Number(n.toFixed(4));

export const stepNumber = (n: number, step: number, min?: number) => {
  const next = clean(n + step);
  return min !== undefined && next < min ? min : next;
};

const NUMBER = /^(-?(?:\d+\.?\d*|\.\d+))([a-z%]*)$/i;
// A hex colour without its # (the Design tab shows 333333): a word of hex
// digits with a letter, or six or eight digits.
const HEXISH = /^[0-9a-f]{3,8}$/i;
const isHexish = (w: string) =>
  HEXISH.test(w) && (/[a-f]/i.test(w) || w.length === 6 || w.length === 8);
// Units whose 1 is a big step.
const FINE_UNITS = /^r?em$/i;

type Part = { start: number; end: number; layer: number; index: number };

// The numbers of `value` outside parentheses, with their place: which
// comma layer, and which number of that layer.
const numbersOf = (value: string): Part[] => {
  const out: Part[] = [];
  let depth = 0;
  let layer = 0;
  let index = 0;
  let start = -1;
  const close = (end: number) => {
    if (start === -1) return;
    const word = value.slice(start, end);
    if (NUMBER.test(word) && !isHexish(word)) {
      out.push({ start, end, layer, index });
      index++;
    }
    start = -1;
  };
  for (let i = 0; i <= value.length; i++) {
    const c = value[i] ?? ' ';
    if (c === '(') depth++;
    if (c === ')') depth = Math.max(0, depth - 1);
    if (depth > 0 || c === ')') {
      // Inside a function: the word it belongs to is not a number.
      start = -1;
      continue;
    }
    if (/[\s,]/.test(c)) {
      close(i);
      if (c === ',') {
        layer++;
        index = 0;
      }
    } else if (start === -1) {
      start = i;
    }
  }
  return out;
};

export type NudgeOptions = {
  // Where the caret is; the number under it (or the last one before it)
  // moves.
  caret?: number;
  // The lowest value, for the whole value or by the number's place in its
  // layer (a shadow's blur is its third number).
  min?: number | ((index: number) => number | undefined);
  // The highest value (a font weight's 900).
  max?: number;
  // The unit a bare non-zero number takes (a shadow's `0` becomes `1px`).
  unit?: string;
  // Step size per key press (a font weight steps by 100).
  by?: number;
  // A unitless number steps by 0.01, as em and rem do (a line height).
  fine?: boolean;
};

// True when the caret sits inside parentheses (rgba(), var()).
const inFunction = (value: string, caret: number) => {
  let depth = 0;
  for (const c of value.slice(0, caret)) {
    if (c === '(') depth++;
    if (c === ')') depth = Math.max(0, depth - 1);
  }
  return depth > 0;
};

export type Nudged = { value: string; start: number; end: number };

// The value with one number stepped, and where that number now sits; null
// when the value has no number to step.
export const nudgeValue = (
  value: string,
  step: number,
  { caret, min, max, unit = '', by = 1, fine = false }: NudgeOptions = {}
): Nudged | null => {
  if (caret !== undefined && inFunction(value, caret)) return null;
  const parts = numbersOf(value);
  if (!parts.length) return null;
  const at =
    caret === undefined
      ? parts[0]
      : [...parts].reverse().find((p) => p.start <= caret) ?? parts[0];
  const [, n, own] = NUMBER.exec(value.slice(at.start, at.end)) ?? [];
  const floor = typeof min === 'function' ? min(at.index) : min;
  const small = FINE_UNITS.test(own ?? '') || (!own && fine);
  const stepped = stepNumber(Number(n), step * by * (small ? 0.01 : 1), floor);
  const next = max !== undefined && stepped > max ? max : stepped;
  const text = `${next}${own || (next !== 0 ? unit : '')}`;
  return {
    value: value.slice(0, at.start) + text + value.slice(at.end),
    start: at.start,
    end: at.start + text.length,
  };
};
