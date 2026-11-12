import assert from "node:assert/strict";
import { test } from "node:test";

import {
  describeStackPosition,
  originalPositionFor,
  parseInlineSourceMap,
} from "./sourceMap.ts";

// Two generated lines. Line 1 maps column 0 -> source 1:0 and column 10 -> source
// 1:12; line 2 maps column 4 -> source 3:2. The strings are VLQ as esbuild emits it.
const map = {
  version: 3,
  sources: ["block.tsx"],
  mappings: "AAAA,UAAY;IAEV",
};

const bundleWith = (sourceMap: object): string =>
  `export default 1;\n//# sourceMappingURL=data:application/json;base64,${Buffer.from(
    JSON.stringify(sourceMap)
  ).toString("base64")}\n`;

test("reads the inline map off the end of a bundle", () => {
  const parsed = parseInlineSourceMap(bundleWith(map));

  assert.ok(parsed);
  assert.equal(parsed.lines.length, 2);
  assert.deepEqual(parsed.lines[0], [
    { column: 0, sourceLine: 0, sourceColumn: 0 },
    { column: 10, sourceLine: 0, sourceColumn: 12 },
  ]);
  assert.deepEqual(parsed.lines[1], [
    { column: 4, sourceLine: 2, sourceColumn: 2 },
  ]);
});

test("is null for a bundle with no map, and for a map it cannot read", () => {
  assert.equal(parseInlineSourceMap("export default 1;"), null);
  assert.equal(
    parseInlineSourceMap(
      "x;\n//# sourceMappingURL=data:application/json;base64,bm90IGpzb24="
    ),
    null
  );
});

test("maps a generated position to the last segment at or before it", () => {
  const parsed = parseInlineSourceMap(bundleWith(map));
  assert.ok(parsed);

  // 1-indexed in, 1-indexed out, like a stack frame and a diagnostic.
  assert.deepEqual(originalPositionFor(parsed, 1, 1), { line: 1, column: 1 });
  assert.deepEqual(originalPositionFor(parsed, 1, 11), {
    line: 1,
    column: 13,
  });
  assert.deepEqual(originalPositionFor(parsed, 1, 20), {
    line: 1,
    column: 13,
  });
  assert.deepEqual(originalPositionFor(parsed, 2, 9), { line: 3, column: 3 });
});

test("has no position before the first segment or past the last line", () => {
  const parsed = parseInlineSourceMap(bundleWith(map));
  assert.ok(parsed);

  assert.equal(originalPositionFor(parsed, 2, 2), null);
  assert.equal(originalPositionFor(parsed, 9, 1), null);
});

test("names the source position of the first frame that points into the bundle", () => {
  const stack = [
    "TypeError: x is not a function",
    "    at useFoo (http://localhost:3000/assets/app.js:100:20)",
    "    at Block (blob:http://localhost:3000/5e3b-9f1a:2:9)",
  ].join("\n");

  assert.equal(
    describeStackPosition(stack, bundleWith(map)),
    "block.tsx line 3, column 3"
  );
});

test("says nothing when the stack never reaches the bundle, or there is no bundle", () => {
  const appOnly = "Error\n    at f (http://localhost:3000/assets/app.js:1:1)";

  assert.equal(describeStackPosition(appOnly, bundleWith(map)), null);
  assert.equal(
    describeStackPosition("Error\n    at Block (blob:x:1:1)", null),
    null
  );
  assert.equal(describeStackPosition(undefined, bundleWith(map)), null);
});
