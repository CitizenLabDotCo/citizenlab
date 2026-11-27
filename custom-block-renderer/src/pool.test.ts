import assert from "node:assert/strict";
import { test } from "node:test";

import { canStillRender } from "./pool.ts";

const NOW = 1_000_000;
const SECONDS = 1_000;

test("a free slot means a render can start", () => {
  assert.equal(canStillRender(1, [NOW - 600 * SECONDS], NOW), true);
});

test("a slot out for a normal render will come back", () => {
  assert.equal(
    canStillRender(0, [NOW - 600 * SECONDS, NOW - 5 * SECONDS], NOW),
    true
  );
});

test("every slot out for longer than any render takes means none will come back", () => {
  assert.equal(
    canStillRender(0, [NOW - 600 * SECONDS, NOW - 121 * SECONDS], NOW),
    false
  );
});

test("a pool with no slots left at all cannot render", () => {
  assert.equal(canStillRender(0, [], NOW), false);
});
