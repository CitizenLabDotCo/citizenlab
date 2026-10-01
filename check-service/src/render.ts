import { readFileSync } from "node:fs";
import { createRequire } from "node:module";

import type { Page } from "playwright";

import { runChecks } from "./checks.ts";
import type { RenderPool } from "./pool.ts";
import {
  MAX_CONSOLE_LINES,
  RENDER_TIMEOUT_MS,
  type BrowserFacts,
  type HarnessFacts,
  type RenderRequest,
  type RenderResponse,
} from "./types.ts";

const require = createRequire(import.meta.url);

/** axe runs inside the page, so it is injected as source rather than imported there. */
let axeSource: string | null = null;
const axe = (): string => {
  axeSource ??= readFileSync(require.resolve("axe-core/axe.min.js"), "utf-8");
  return axeSource;
};

const dedupe = (lines: string[]): string[] => [...new Set(lines)];

const collectBrowserFacts = (page: Page): BrowserFacts => {
  const facts: BrowserFacts = {
    console: [],
    warnings: [],
    pageErrors: [],
    failedRequests: [],
  };

  page.on("console", (message) => {
    if (message.type() === "error") facts.console.push(message.text());
    if (message.type() === "warning") facts.warnings.push(message.text());
  });
  page.on("pageerror", (error) => {
    facts.pageErrors.push(error.message);
  });
  page.on("requestfailed", (request) => {
    facts.failedRequests.push({
      url: request.url(),
      reason: request.failure()?.errorText ?? "request failed",
    });
  });
  page.on("response", (response) => {
    if (response.status() >= 400) {
      facts.failedRequests.push({
        url: response.url(),
        reason: `HTTP ${response.status()}`,
      });
    }
  });

  return facts;
};

/**
 * Mounts a block (or a whole report) in the browser that also renders it for the
 * reader, and reports what happened.
 *
 * jsdom and happy-dom have no layout engine, so they cannot see a chart that
 * collapsed to zero height, a label that overflowed, or a table wider than the page
 * — which is exactly the set of defects a compile check already misses.
 */
export const render = async (
  pool: RenderPool,
  input: RenderRequest
): Promise<RenderResponse> => {
  const slot = await pool.acquire();
  const page = await slot.context.newPage();
  const browserFacts = collectBrowserFacts(page);
  let harnessFacts: HarnessFacts | null = null;

  try {
    // Locale-prefixed, like every route in this app, and deliberately not under
    // /admin: this browser has no session and would be redirected to a sign-in page.
    await page.goto(`${input.appOrigin}/${input.locale}/block-harness`, {
      waitUntil: "domcontentloaded",
      timeout: RENDER_TIMEOUT_MS,
    });
    await page.addScriptTag({ content: axe() });

    // The harness installs itself once the app has booted. Reached through
    // globalThis because this service is Node-only: pulling in the DOM lib to
    // describe one property would type the whole server as if it ran in a browser.
    await page.waitForFunction(
      () =>
        Boolean(
          (globalThis as unknown as { __blockHarness?: unknown }).__blockHarness
        ),
      null,
      { timeout: RENDER_TIMEOUT_MS }
    );

    // Everything so far belongs to the app starting up — a 401 on the signed-out
    // session, a deprecation warning from a mapping library. None of it is the
    // block's doing, and a model told its chart broke the session would go and
    // rewrite the chart. From here on, what is collected is the block's.
    browserFacts.console.length = 0;
    browserFacts.warnings.length = 0;
    browserFacts.pageErrors.length = 0;
    browserFacts.failedRequests.length = 0;

    harnessFacts = (await page.evaluate(
      (message) =>
        (
          globalThis as unknown as {
            __blockHarness: { run(m: unknown): Promise<unknown> };
          }
        ).__blockHarness.run(message),
      {
        target: input.target,
        locale: input.locale,
        token: input.token,
        layoutId: input.layoutId,
      }
    )) as HarnessFacts;
  } catch (error) {
    browserFacts.pageErrors.push(
      error instanceof Error ? error.message : String(error)
    );
  }

  const checks = runChecks(harnessFacts, {
    ...browserFacts,
    console: dedupe(browserFacts.console).slice(0, MAX_CONSOLE_LINES),
    warnings: dedupe(browserFacts.warnings).slice(0, MAX_CONSOLE_LINES),
  });

  // The picture always travels with the result; Rails decides whether the model
  // needs to see it (section 7.4).
  const wantsScreenshot = input.screenshot !== false;
  const screenshot = wantsScreenshot
    ? await page
        .locator("#harness-root")
        .screenshot({ type: "png", timeout: 5_000 })
        .then((buffer) => buffer.toString("base64"))
        .catch(() => null)
    : null;

  await page.close().catch(() => undefined);
  await pool.release(slot);

  return {
    mounted: harnessFacts?.mounted ?? false,
    errors: [
      ...browserFacts.pageErrors,
      ...(harnessFacts?.boundaryError
        ? [harnessFacts.boundaryError.message]
        : []),
    ],
    console: dedupe(browserFacts.console).slice(0, MAX_CONSOLE_LINES),
    warnings: dedupe(browserFacts.warnings).slice(0, MAX_CONSOLE_LINES),
    failedRequests: browserFacts.failedRequests,
    metrics: harnessFacts?.metrics ?? null,
    a11y: harnessFacts?.a11y ?? null,
    checks,
    screenshot,
  };
};
