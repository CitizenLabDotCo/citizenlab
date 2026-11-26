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

test("a block cannot open a WebRTC connection", () => {
  const source = `
    export default function Block() {
      const connection = new RTCPeerConnection();
      return null;
    }
  `;

  assert.ok(rules(source).includes("no-network"));
});

test("a label mapped from a query value is text a reader sees", () => {
  const source = `
    import { Box } from 'gv-sdk';
    export default function Block({ msg }: { msg: (key: string) => string }) {
      const labels: Record<string, string> = { reaction: 'Reactions', input: 'Ideas posted' };
      return <Box>{labels.reaction}{msg('title')}</Box>;
    }
  `;

  assert.equal(
    rules(source).filter((rule) => rule === "translated-strings").length,
    2
  );
});

test("the wiring a block is made of is not copy", () => {
  const source = `
    import { Box, BarChart, Bar, XAxis } from 'gv-sdk';

    const SQL = \`SELECT type AS label FROM reporting_contributions WHERE project_id = 'd9f0c3e2'\`;

    export default function Block({ msg }: { msg: (key: string) => string }) {
      const style = { margin: '0 0 12px', border: 'rgba(0, 0, 0, 0.1)' };
      return (
        <Box p="24px" style={style}>
          <BarChart data={[]} layout="vertical">
            <XAxis type="number" dataKey="participants" />
            <Bar dataKey="total" />
          </BarChart>
          {msg('title')}
        </Box>
      );
    }
  `;

  assert.deepEqual(
    rules(source).filter((rule) => rule === "translated-strings"),
    []
  );
});
