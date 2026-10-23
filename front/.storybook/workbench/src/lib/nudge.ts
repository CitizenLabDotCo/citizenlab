// Arrow keys on a value field, as Figma steps its fields: ArrowUp adds 1,
// ArrowDown takes 1, with Shift by 10. The unit stays. In a composite value
// (a shadow, a border) the number at the caret moves, else the first one;
// numbers inside a function (rgba(), var()) and hex colours never do.

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
    if (NUMBER.test(value.slice(start, end))) {
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
  // The unit a bare non-zero number takes (a shadow's `0` becomes `1px`).
  unit?: string;
};

export type Nudged = { value: string; start: number; end: number };

// The value with one number stepped, and where that number now sits; null
// when the value has no number to step.
export const nudgeValue = (
  value: string,
  step: number,
  { caret, min, unit = '' }: NudgeOptions = {}
): Nudged | null => {
  const parts = numbersOf(value);
  if (!parts.length) return null;
  const at =
    caret === undefined
      ? parts[0]
      : [...parts].reverse().find((p) => p.start <= caret) ?? parts[0];
  const [, n, own] = NUMBER.exec(value.slice(at.start, at.end)) ?? [];
  const floor = typeof min === 'function' ? min(at.index) : min;
  const next = stepNumber(Number(n), step, floor);
  const text = `${next}${own || (next !== 0 ? unit : '')}`;
  return {
    value: value.slice(0, at.start) + text + value.slice(at.end),
    start: at.start,
    end: at.start + text.length,
  };
};
