/*
 * Source positions for the code index: file offsets to Loc, and offsets in a
 * template's cooked strings back to the raw source they were written as.
 */
import { Loc } from './schema';

/**
 * Line start offsets of a source, for offset -> line/col. Line breaks are
 * Babel's (\r\n, \r, \n,  ,  ), so a Loc matches node.loc.
 */
export class Lines {
  private starts: number[] = [0];

  constructor(source: string) {
    for (let i = 0; i < source.length; i++) {
      const c = source.charCodeAt(i);
      if (c === 13 && source.charCodeAt(i + 1) === 10) continue;
      if (c === 10 || c === 13 || c === 0x2028 || c === 0x2029) {
        this.starts.push(i + 1);
      }
    }
  }

  /** 1-based line and 0-based column of a file offset. */
  at(offset: number): { line: number; col: number } {
    let lo = 0;
    let hi = this.starts.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (this.starts[mid] <= offset) lo = mid;
      else hi = mid - 1;
    }
    return { line: lo + 1, col: offset - this.starts[lo] };
  }

  loc(start: number, end: number): Loc {
    const a = this.at(start);
    const b = this.at(end);
    return {
      start,
      end,
      line: a.line,
      col: a.col,
      endLine: b.line,
      endCol: b.col,
    };
  }
}

// The length of the escape sequence at raw[i] (a backslash) and the number of
// UTF-16 units it cooks to.
const escapeAt = (raw: string, i: number): [number, number] => {
  const c = raw[i + 1];
  if (c === undefined) return [1, 0];
  // A line continuation cooks to nothing.
  if (c === '\r') return [raw[i + 2] === '\n' ? 3 : 2, 0];
  if (c === '\n' || c === '\u2028' || c === '\u2029') return [2, 0];
  if (c === 'x') return [4, 1];
  if (c === 'u') {
    if (raw[i + 2] === '{') {
      const close = raw.indexOf('}', i + 3);
      if (close < 0) return [2, 1];
      const cp = parseInt(raw.slice(i + 3, close), 16);
      return [close - i + 1, cp > 0xffff ? 2 : 1];
    }
    return [6, 1];
  }
  return [2, 1];
};

/**
 * For each offset of the cooked string (and one past its end), the offset in
 * `raw` where that character is written. `raw` is the text between the
 * delimiters (a template quasi's raw value, or a string literal without its
 * quotes).
 */
export const rawOffsets = (raw: string): number[] => {
  const out: number[] = [];
  let i = 0;
  while (i < raw.length) {
    if (raw[i] === '\\') {
      const [len, cooked] = escapeAt(raw, i);
      for (let k = 0; k < cooked; k++) out.push(i);
      i += len;
    } else {
      out.push(i);
      i++;
    }
  }
  out.push(raw.length);
  return out;
};
