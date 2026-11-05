import assert from "node:assert/strict";
import path from "node:path";
import { before, describe, it } from "node:test";

process.env.SDK_TYPES_PATH ??= path.join(
  import.meta.dirname,
  "../../front/app/components/admin/ContentBuilder/CustomBlocks/sdk/v1/gv-sdk.d.ts"
);

const { build } = await import("./build.ts");

const GOOD_SOURCE = `
import { Box, Title, useReportingData, BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'gv-sdk';
import type { BlockProps } from 'gv-sdk';

const SQL = \`
  SELECT date_trunc('month', created_at) AS month, COUNT(*) AS contributions
  FROM reporting_contributions
  GROUP BY 1 ORDER BY 1
\`;

export default function Block({ msg }: BlockProps) {
  const { data, isLoading } = useReportingData(SQL);
  if (isLoading || !data) return null;

  return (
    <Box>
      <Title variant="h3">{msg('title')}</Title>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data.rows}>
          <XAxis dataKey="month" />
          <YAxis />
          <Bar dataKey="contributions" />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
}
`;

const MESSAGES = { en: { title: "Contributions per month" } };

const run = (source: string, overrides: Record<string, unknown> = {}) =>
  build({
    source,
    manifest: {
      sdk_version: "v1",
      targets: ["report"],
      data_uses: ["useReportingData"],
    },
    messages: MESSAGES,
    locales: ["en"],
    ...overrides,
  } as Parameters<typeof build>[0]);

describe("POST /build", () => {
  let good: Awaited<ReturnType<typeof build>>;

  before(async () => {
    good = await run(GOOD_SOURCE);
  });

  it("accepts a well-formed block", () => {
    assert.deepEqual(good.diagnostics, []);
    assert.equal(good.ok, true);
    assert.ok(good.bundle);
  });

  it("rewrites the SDK import to the shim so blocks share the app runtime", () => {
    assert.match(good.bundle!, /from\s*"\/custom-block-sdk\/v1\.js"/);
  });

  it("extracts the SQL through a const into the manifest", () => {
    assert.equal((good.manifest.queries as string[]).length, 1);
    assert.match(
      (good.manifest.queries as string[])[0]!,
      /FROM reporting_contributions/
    );
  });

  it("records the toolchain that produced the bundle", () => {
    assert.ok(good.toolchain.esbuild);
    assert.ok(good.toolchain.typescript);
    assert.equal(good.toolchain.sdk, "v1");
  });

  it("reports a type error and a forbidden import in one answer", async () => {
    const result = await run(`
      import { Box } from 'gv-sdk';
      import { chunk } from 'lodash';

      export default function Block() {
        const n: number = 'not a number';
        return <Box>{chunk([n]).length}</Box>;
      }
    `);

    assert.equal(result.ok, false);
    assert.equal(result.bundle, null);
    assert.ok(result.diagnostics.some((d) => d.kind === "type"));
    assert.ok(result.diagnostics.some((d) => d.rule === "imports-allowlist"));
  });

  it("rejects SQL that is assembled at run time", async () => {
    const result = await run(`
      import { Box, useReportingData } from 'gv-sdk';

      export default function Block({ config }: { config: { table: string } }) {
        const { data } = useReportingData(\`SELECT * FROM \${config.table}\`);
        return <Box>{data ? data.rows.length : 0}</Box>;
      }
    `);

    assert.equal(result.ok, false);
    assert.ok(result.diagnostics.some((d) => d.rule === "static-sql"));
  });

  it("rejects visible text that does not go through msg()", async () => {
    const result = await run(`
      import { Box } from 'gv-sdk';

      export default function Block() {
        return <Box>Participation over time</Box>;
      }
    `);

    assert.equal(result.ok, false);
    assert.ok(
      result.diagnostics.some(
        (d) => d.rule === "translated-strings" && d.line !== null
      )
    );
  });

  it("rejects network access and eval", async () => {
    const result = await run(`
      import { Box } from 'gv-sdk';

      export default function Block() {
        void fetch('/web_api/v1/users');
        return <Box>{String(eval('1'))}</Box>;
      }
    `);

    assert.equal(result.ok, false);
    assert.ok(result.diagnostics.some((d) => d.rule === "no-network"));
    assert.ok(result.diagnostics.some((d) => d.rule === "no-eval"));
  });

  it("names the locale whose catalogue is missing a key the source uses", async () => {
    const result = await run(GOOD_SOURCE, { locales: ["en", "nl-NL"] });

    assert.equal(result.ok, false);
    assert.ok(
      result.diagnostics.some(
        (d) => d.kind === "message" && d.message.includes("nl-NL")
      )
    );
  });

  it("reports catalogue keys the source never uses", async () => {
    const result = await run(GOOD_SOURCE, {
      messages: { en: { title: "Contributions", subtitle: "unused" } },
    });

    assert.equal(result.ok, false);
    assert.ok(result.diagnostics.some((d) => d.message.includes("subtitle")));
  });
});
