import {
  MIN_BLOCK_HEIGHT_PX,
  type BrowserFacts,
  type Check,
  type HarnessFacts,
} from "./types.ts";

const check = (id: string, ok: boolean, message: string): Check => ({
  id,
  ok,
  message,
});

/**
 * Turns what the page reported and what the browser saw into a list of verdicts.
 *
 * Pure on purpose. The page executes generated code, and generated code can patch
 * `console.error` or swallow its own exceptions, by accident or otherwise — so the
 * facts that matter come from Playwright's event stream, outside the page, and the
 * judgement happens here where the block cannot reach it.
 */
export const runChecks = (
  harness: HarnessFacts | null,
  browser: BrowserFacts
): Check[] => {
  if (harness === null) {
    return [check("mounted", false, "The block never reported back.")];
  }

  const checks: Check[] = [
    check(
      "mounted",
      harness.mounted && harness.boundaryError === null,
      harness.boundaryError
        ? `The block threw while rendering: ${harness.boundaryError.message}`
        : "The block mounted."
    ),
    check(
      "no_runtime_errors",
      browser.pageErrors.length === 0,
      browser.pageErrors.length === 0
        ? "No runtime errors."
        : `Runtime errors: ${browser.pageErrors.join(" | ")}`
    ),
    check(
      "no_console_errors",
      browser.console.length === 0,
      browser.console.length === 0
        ? "Nothing logged to the console."
        : `Console errors: ${browser.console.join(" | ")}`
    ),
    check(
      "data_loaded",
      browser.failedRequests.length === 0,
      browser.failedRequests.length === 0
        ? "Every request succeeded."
        : `Requests that failed: ${browser.failedRequests
            .map((request) => `${request.url} (${request.reason})`)
            .join(" | ")}`
    ),
  ];

  // A chart that drew no bars or lines is the failure a compile check cannot see:
  // the block is correct TypeScript and renders an empty frame.
  const emptyCharts = harness.metrics.charts.filter(
    (chart) => (chart.dataElements ?? 0) === 0
  );
  if (harness.metrics.charts.length > 0) {
    checks.push(
      check(
        "has_data_points",
        emptyCharts.length === 0,
        emptyCharts.length === 0
          ? "Every chart drew its data."
          : `${emptyCharts.length} chart(s) rendered no data. Check that the query returns rows and that dataKey matches a column name.`
      )
    );
  }

  const overflowing = harness.metrics.boxes.filter(
    (box) => box.width > harness.metrics.root.width + 1
  );
  checks.push(
    check(
      "no_overflow",
      overflowing.length === 0,
      overflowing.length === 0
        ? "Nothing is wider than the page."
        : `${overflowing.length} element(s) are wider than the ${Math.round(
            harness.metrics.root.width
          )}px page and would be cut off in the PDF.`
    )
  );

  checks.push(
    check(
      "has_height",
      harness.metrics.root.height >= MIN_BLOCK_HEIGHT_PX,
      harness.metrics.root.height >= MIN_BLOCK_HEIGHT_PX
        ? "The block has height."
        : `The block is only ${Math.round(
            harness.metrics.root.height
          )}px tall. A chart needs an explicit height, usually through ResponsiveContainer.`
    )
  );

  const critical = harness.a11y.violations.filter(
    (violation) => violation.impact === "critical"
  );
  checks.push(
    check(
      "a11y_no_critical",
      critical.length === 0,
      critical.length === 0
        ? "No critical accessibility problems."
        : `Critical accessibility problems: ${critical
            .map((violation) => violation.help)
            .join(" | ")}`
    )
  );

  return checks;
};

export const failedChecks = (checks: Check[]): Check[] =>
  checks.filter((entry) => !entry.ok);
