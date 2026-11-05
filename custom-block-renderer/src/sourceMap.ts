/**
 * Maps a position in a compiled bundle back to the block's source.
 *
 * esbuild inlines a source map at the end of every bundle. A runtime error in the
 * browser names a line in that bundle, which means nothing to the model; the line in
 * block.tsx does. This is the small part of the source-map spec that is needed for
 * that: decode the `mappings` string, find the last segment at or before a column.
 */

const INLINE_MAP =
  /\/\/# sourceMappingURL=data:application\/json;(?:charset=[^;]+;)?base64,([A-Za-z0-9+/=]+)\s*$/;

const BASE64 =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

interface Segment {
  column: number;
  sourceLine: number;
  sourceColumn: number;
}

export interface SourceMap {
  /** Segments per generated line, each sorted by generated column. 0-indexed. */
  lines: Segment[][];
}

export interface OriginalPosition {
  /** 1-indexed, like a diagnostic. */
  line: number;
  column: number;
}

const decodeVlq = (
  text: string,
  start: number
): { value: number; next: number } => {
  let result = 0;
  let shift = 0;
  let index = start;
  for (;;) {
    const char = text[index];
    const digit = char === undefined ? -1 : BASE64.indexOf(char);
    if (digit === -1) throw new Error("Malformed source map mappings.");
    index += 1;
    result += (digit & 31) << shift;
    if ((digit & 32) === 0) break;
    shift += 5;
  }
  const negative = (result & 1) === 1;
  const value = result >> 1;
  return { value: negative ? -value : value, next: index };
};

/** Reads the inline source map off a bundle. Null when there is none. */
export const parseInlineSourceMap = (bundle: string): SourceMap | null => {
  const encoded = INLINE_MAP.exec(bundle)?.[1];
  if (!encoded) return null;

  let mappings: string;
  try {
    const json = JSON.parse(
      Buffer.from(encoded, "base64").toString("utf-8")
    ) as { mappings?: unknown };
    if (typeof json.mappings !== "string") return null;
    mappings = json.mappings;
  } catch {
    return null;
  }

  const lines: Segment[][] = [];
  let sourceLine = 0;
  let sourceColumn = 0;
  for (const lineText of mappings.split(";")) {
    const segments: Segment[] = [];
    let column = 0;
    let index = 0;
    while (index < lineText.length) {
      if (lineText[index] === ",") {
        index += 1;
        continue;
      }
      const generated = decodeVlq(lineText, index);
      column += generated.value;
      index = generated.next;
      // A one-field segment has no source position; it only marks generated code.
      if (index >= lineText.length || lineText[index] === ",") {
        continue;
      }
      // The source index (second field) is skipped: a block has exactly one source.
      index = decodeVlq(lineText, index).next;
      const line = decodeVlq(lineText, index);
      sourceLine += line.value;
      index = line.next;
      const col = decodeVlq(lineText, index);
      sourceColumn += col.value;
      index = col.next;
      // An optional fifth field names a symbol; skip it.
      if (index < lineText.length && lineText[index] !== ",") {
        index = decodeVlq(lineText, index).next;
      }
      segments.push({ column, sourceLine, sourceColumn });
    }
    lines.push(segments);
  }

  return { lines };
};

/**
 * The source position for a generated one. Both arguments are 1-indexed, as a
 * browser stack frame reports them.
 */
export const originalPositionFor = (
  map: SourceMap,
  line: number,
  column: number
): OriginalPosition | null => {
  const segments = map.lines[line - 1];
  if (!segments || segments.length === 0) return null;

  const generatedColumn = column - 1;
  let found: Segment | null = null;
  for (const segment of segments) {
    if (segment.column > generatedColumn) break;
    found = segment;
  }
  if (!found) return null;

  return { line: found.sourceLine + 1, column: found.sourceColumn + 1 };
};

/**
 * Finds the first frame of a stack that points into the bundle and names its source
 * position, so "at Block (blob:…:14:9)" becomes "block.tsx line 3, column 12".
 *
 * The bundle is loaded from a blob: URL in the harness, so that is what frames
 * reference. Frames into the app's own code are skipped: the block cannot fix those.
 */
export const describeStackPosition = (
  stack: string | undefined,
  bundle: string | null
): string | null => {
  if (!stack || !bundle) return null;
  const map = parseInlineSourceMap(bundle);
  if (!map) return null;

  for (const frame of stack.split("\n")) {
    const match = /blob:[^\s)]+:(\d+):(\d+)/.exec(frame);
    if (!match) continue;
    const position = originalPositionFor(
      map,
      Number(match[1]),
      Number(match[2])
    );
    if (position) {
      return `block.tsx line ${position.line}, column ${position.column}`;
    }
  }

  return null;
};
