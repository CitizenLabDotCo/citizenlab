import assert from "node:assert/strict";
import { test } from "node:test";

import { DeadlineExceeded, withDeadline } from "./deadline.ts";

const never = new Promise<never>(() => undefined);

test("work that finishes in time keeps its result", async () => {
  assert.equal(await withDeadline(Promise.resolve(42), 1_000, "late"), 42);
});

test("work that fails in time keeps its own error", async () => {
  await assert.rejects(
    withDeadline(Promise.reject(new Error("broken")), 1_000, "late"),
    { message: "broken" }
  );
});

test("work that never finishes is given up on with the message", async () => {
  await assert.rejects(withDeadline(never, 10, "too slow"), (error) => {
    assert.ok(error instanceof DeadlineExceeded);
    assert.equal(error.message, "too slow");
    return true;
  });
});
