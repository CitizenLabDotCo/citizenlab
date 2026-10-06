import assert from "node:assert/strict";
import { test } from "node:test";

import { failedChecks, runChecks } from "./checks.ts";
import type { BrowserFacts, Check, HarnessFacts } from "./types.ts";

const noBrowserTrouble = (): BrowserFacts => ({
  console: [],
  pageErrors: [],
  failedRequests: [],
});

const healthy = (overrides: Partial<HarnessFacts> = {}): HarnessFacts => ({
  mounted: true,
  boundaryError: null,
  metrics: {
    root: { width: 794, height: 320 },
    charts: [{ nodeId: "c1", width: 700, height: 280, dataElements: 12 }],
    boxes: [{ nodeId: "c1", width: 700, height: 280 }],
  },
  a11y: { violations: [] },
  ...overrides,
});

const verdict = (checks: Check[], id: string): Check => {
  const found = checks.find((check) => check.id === id);
  assert.ok(found, `expected a '${id}' check`);
  return found;
};

test("a healthy block passes every check", () => {
  const checks = runChecks(healthy(), noBrowserTrouble());

  assert.deepEqual(failedChecks(checks), []);
});

test("a page that never reported back fails rather than passing silently", () => {
  const checks = runChecks(null, noBrowserTrouble());

  assert.equal(verdict(checks, "mounted").ok, false);
});

test("the error boundary firing is a failure to mount", () => {
  const checks = runChecks(
    healthy({ boundaryError: { message: "cannot read rows of undefined" } }),
    noBrowserTrouble()
  );

  const mounted = verdict(checks, "mounted");
  assert.equal(mounted.ok, false);
  assert.match(mounted.message, /cannot read rows/);
});

// The defect a compile check cannot see: correct TypeScript, empty frame.
test("a chart that drew no data fails even though it mounted", () => {
  const checks = runChecks(
    healthy({
      metrics: {
        root: { width: 794, height: 320 },
        charts: [{ nodeId: "c1", width: 700, height: 280, dataElements: 0 }],
        boxes: [],
      },
    }),
    noBrowserTrouble()
  );

  assert.equal(verdict(checks, "mounted").ok, true);
  assert.equal(verdict(checks, "has_data_points").ok, false);
});

test("a block with no charts is not asked whether its charts drew", () => {
  const checks = runChecks(
    healthy({
      metrics: {
        root: { width: 794, height: 320 },
        charts: [],
        boxes: [],
      },
    }),
    noBrowserTrouble()
  );

  assert.equal(
    checks.find((check) => check.id === "has_data_points"),
    undefined
  );
});

test("anything wider than the page fails, because the PDF would cut it off", () => {
  const checks = runChecks(
    healthy({
      metrics: {
        root: { width: 794, height: 320 },
        charts: [],
        boxes: [{ nodeId: "t1", width: 1200, height: 100 }],
      },
    }),
    noBrowserTrouble()
  );

  assert.equal(verdict(checks, "no_overflow").ok, false);
  assert.match(verdict(checks, "no_overflow").message, /794px/);
});

test("a block collapsed to nothing fails on height", () => {
  const checks = runChecks(
    healthy({
      metrics: { root: { width: 794, height: 4 }, charts: [], boxes: [] },
    }),
    noBrowserTrouble()
  );

  assert.equal(verdict(checks, "has_height").ok, false);
  assert.match(verdict(checks, "has_height").message, /ResponsiveContainer/);
});

// These come from Playwright's own event stream, which the page cannot patch.
test("a runtime error fails even when the page claims it mounted", () => {
  const checks = runChecks(healthy(), {
    ...noBrowserTrouble(),
    pageErrors: ["TypeError: x is not a function"],
  });

  assert.equal(verdict(checks, "mounted").ok, true);
  assert.equal(verdict(checks, "no_runtime_errors").ok, false);
});

test("a failed data request is reported with its url", () => {
  const checks = runChecks(healthy(), {
    ...noBrowserTrouble(),
    failedRequests: [
      { url: "/web_api/v1/reporting_queries", reason: "HTTP 422" },
    ],
  });

  assert.equal(verdict(checks, "data_loaded").ok, false);
  assert.match(verdict(checks, "data_loaded").message, /reporting_queries/);
});

test("only critical accessibility problems fail the check", () => {
  const serious = runChecks(
    healthy({
      a11y: {
        violations: [{ id: "color-contrast", impact: "serious", help: "x" }],
      },
    }),
    noBrowserTrouble()
  );
  assert.equal(verdict(serious, "a11y_no_critical").ok, true);

  const critical = runChecks(
    healthy({
      a11y: {
        violations: [
          { id: "aria-required", impact: "critical", help: "needs a label" },
        ],
      },
    }),
    noBrowserTrouble()
  );
  assert.equal(verdict(critical, "a11y_no_critical").ok, false);
});
