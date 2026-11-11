import assert from "node:assert/strict";
import { test } from "node:test";

import { lint } from "./lint.ts";

const rules = (source: string): string[] =>
  lint(source, { en: {} }, ["en"]).diagnostics.map(
    (diagnostic) => diagnostic.rule
  );

test("an assertion waives the check the compiler would have required", () => {
  const source = `
    import { Box } from 'gv-sdk';
    export default function Block({ config }: { config: Record<string, unknown> }) {
      return <Box>{(config.title as string).toUpperCase()}</Box>;
    }
  `;

  assert.ok(rules(source).includes("no-type-assertion"));
});

test("as const asserts nothing about a value", () => {
  const source = `
    const SIZES = ['s', 'm'] as const;
    export default function Block() {
      return null;
    }
  `;

  assert.ok(!rules(source).includes("no-type-assertion"));
});

test("narrowing is how a block reads its config", () => {
  const source = `
    import { Box } from 'gv-sdk';
    export default function Block({ config }: { config: Record<string, unknown> }) {
      const title = typeof config.title === 'string' ? config.title : '';
      return <Box>{title}</Box>;
    }
  `;

  assert.ok(!rules(source).includes("no-type-assertion"));
});
