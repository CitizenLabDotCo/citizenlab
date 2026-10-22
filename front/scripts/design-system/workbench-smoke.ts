// Smoke test of the workbench shell inside a built Storybook.
//
//   npm run ds:smoke -- [--dir storybook-static] [--screenshot <file.png>]
//                       [--canvas-screenshot <file.png>]
//
// Serves the static dir on a free local port, opens /workbench/#/start in
// Chromium and checks that the nav lists every section, the Start here page
// renders and nothing is logged as a console error. Optional data files that
// a build may lack (see OPTIONAL_DATA) are allowed to 404. Then opens a
// Button story on the canvas: the mode toolbar puts data-gv-mode on the
// frame's root, a share link override changes the button's computed
// border-radius, and a bad share link shows a notice and keeps the
// session. Exits 1 on failure,
// 2 when Playwright is missing. Playwright is loaded through ./playwright.
import fs from 'fs';
import http from 'http';
import { AddressInfo } from 'net';
import path from 'path';

import { loadPlaywright } from './playwright';

export const EXPECTED_NAV = [
  'Start here',
  'Foundations',
  'Components',
  'Patterns',
  'Pages',
  'Review',
  'Proposal',
];

const ROUTES: [string, string][] = [
  ['#/foundations', 'Foundations'],
  ['#/foundations/color', 'Foundations: color'],
  ['#/components', 'Components'],
  ['#/patterns', 'Patterns'],
  ['#/pages', 'Pages'],
  ['#/review', 'Review'],
  ['#/proposal', 'Proposal'],
];

// The canvas checks need a story whose radius goes through the theme bridge
// (theme.borderRadius is var(--gv-radius-control, 3px)).
const RADIUS_TOKEN = '--gv-radius-control';
const RADIUS_OVERRIDE = '20px';

// A Button story from the build's index.json, primary first.
export const pickButtonStory = (index: unknown): string | null => {
  const entries = Object.values(
    (index as { entries?: Record<string, { id: string; type?: string }> })
      ?.entries ?? {}
  ).filter((e) => e.type === 'story' && e.id.startsWith('components-button--'));
  return (
    entries.find((e) => e.id === 'components-button--primary')?.id ??
    entries[0]?.id ??
    null
  );
};

// The share-link payload the shell reads (base64url JSON).
const sharePayload = (o: Record<string, string>) =>
  Buffer.from(JSON.stringify(o), 'utf8').toString('base64url');

const OPTIONAL_DATA = [
  '/design-scan.json',
  '/design-changes.json',
  '/a11y-results.json',
  '/audits/index.json',
];

const TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ico': 'image/x-icon',
};

const arg = (name: string) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : undefined;
};

// The file under `root` that a request path names, or null when the path is
// malformed or points outside `root` (`..`, encoded slashes, sibling folders).
export const resolveStaticPath = (
  root: string,
  reqUrl: string
): string | null => {
  let urlPath: string;
  try {
    urlPath = decodeURIComponent(new URL(reqUrl, 'http://x').pathname);
  } catch {
    return null;
  }
  const file = path.resolve(root, `.${urlPath}`);
  const rel = path.relative(root, file);
  if (rel.startsWith('..') || path.isAbsolute(rel)) return null;
  return file;
};

const serve = (root: string): Promise<http.Server> =>
  new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      let file = resolveStaticPath(root, req.url ?? '/');
      if (!file) {
        res.writeHead(400).end();
        return;
      }
      if (fs.existsSync(file) && fs.statSync(file).isDirectory()) {
        file = path.join(file, 'index.html');
      }
      if (!fs.existsSync(file)) {
        res.writeHead(404).end('not found');
        return;
      }
      res.writeHead(200, {
        'Content-Type': TYPES[path.extname(file)] ?? 'application/octet-stream',
      });
      fs.createReadStream(file)
        .on('error', () => res.destroy())
        .pipe(res);
    });
    server.listen(0, '127.0.0.1', () => resolve(server));
  });

// The canvas frame once it shows `id` with the given mode global.
const canvasFrame = async (page: any, mode: string) => {
  const handle = await page.waitForSelector(
    `iframe[data-testid="wb-canvas"][src*="mode:${mode}"]`,
    { timeout: 10000 }
  );
  const frame = await handle.contentFrame();
  await frame.waitForSelector('#storybook-root button', { timeout: 20000 });
  return frame;
};

const radiusOf = (frame: any): Promise<string> =>
  frame.$eval(
    '#storybook-root button',
    (el: Element) => getComputedStyle(el).borderTopLeftRadius
  );

const canvasChecks = async (
  page: any,
  base: string,
  storyId: string,
  failures: string[],
  screenshot?: string
) => {
  await page.goto(`${base}/workbench/#/components/${storyId}`);
  await page.waitForFunction(
    (h: string) => document.querySelector('main h1')?.textContent === h,
    `Component: ${storyId}`,
    { timeout: 5000 }
  );
  if (!(await page.isVisible('aside[aria-label="Panels"] h2'))) {
    failures.push('the panel column is not shown on a component page');
  }
  await canvasFrame(page, 'today');

  // Mode toolbar: the frame's html gets the attribute.
  await page.selectOption('[data-testid="wb-toolbar-mode"]', 'redesign');
  const frame = await canvasFrame(page, 'redesign');
  const attr = await frame.$eval('html', (el: Element) =>
    el.getAttribute('data-gv-mode')
  );
  if (attr !== 'redesign') {
    failures.push(`mode redesign: frame html data-gv-mode is ${attr}`);
  }

  // Share link override: the computed radius follows it.
  const before = await radiusOf(frame);
  const payload = sharePayload({ [RADIUS_TOKEN]: RADIUS_OVERRIDE });
  await page.evaluate((h: string) => {
    window.location.hash = h;
  }, `#/components/${storyId}?o=${payload}`);
  try {
    await frame.waitForFunction(
      (v: string) => {
        const el = document.querySelector('#storybook-root button');
        return !!el && getComputedStyle(el).borderTopLeftRadius === v;
      },
      RADIUS_OVERRIDE,
      { timeout: 5000 }
    );
  } catch {
    failures.push(
      `override ${RADIUS_TOKEN}=${RADIUS_OVERRIDE}: border-radius stayed ${await radiusOf(
        frame
      )}`
    );
  }
  console.log(
    `canvas: ${storyId}, mode redesign on the frame; ${RADIUS_TOKEN} ${before} -> ${await radiusOf(
      frame
    )}`
  );
  if (screenshot) {
    await page.screenshot({ path: path.resolve(screenshot) });
    console.log(`canvas screenshot: ${path.resolve(screenshot)}`);
  }

  // A bad share link applies nothing, keeps the session and says so.
  const bad = sharePayload({ [RADIUS_TOKEN]: 'image-set("x.png" 1x)' });
  await page.evaluate((h: string) => {
    window.location.hash = h;
  }, `#/components/${storyId}?o=${bad}`);
  try {
    await page.waitForSelector('[data-testid="wb-notice"]', { timeout: 5000 });
  } catch {
    failures.push('a rejected share link shows no notice');
  }
  const after = await radiusOf(frame);
  if (after !== RADIUS_OVERRIDE) {
    failures.push(
      `a rejected share link changed the session: border-radius ${after}`
    );
  }
};

const main = async () => {
  const root = path.resolve(arg('dir') ?? 'storybook-static');
  const screenshot = arg('screenshot');
  const canvasScreenshot = arg('canvas-screenshot');
  if (!fs.existsSync(path.join(root, 'workbench', 'index.html'))) {
    console.error(
      `No workbench in ${root}. Run npm run build-storybook first.`
    );
    process.exit(1);
  }

  const { chromium } = loadPlaywright();
  const server = await serve(root);
  const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  const failures: string[] = [];
  const browser = await chromium.launch({ chromiumSandbox: false });
  let storyId: string | null = null;
  try {
    storyId = pickButtonStory(
      JSON.parse(fs.readFileSync(path.join(root, 'index.json'), 'utf8'))
    );
  } catch {
    // Reported below.
  }

  try {
    const page = await browser.newPage({
      viewport: { width: 1280, height: 800 },
    });
    page.on('console', (msg: any) => {
      if (msg.type() !== 'error') return;
      const url: string = msg.location()?.url ?? '';
      const optional = OPTIONAL_DATA.some((p) => url.endsWith(p));
      if (optional && /Failed to load resource/.test(msg.text())) return;
      failures.push(`console error: ${msg.text()} ${url}`.trim());
    });
    page.on('pageerror', (err: Error) =>
      failures.push(`page error: ${err.message}`)
    );

    await page.goto(`${base}/workbench/#/start`, { waitUntil: 'networkidle' });
    await page.waitForSelector('h1:has-text("Start here")', { timeout: 10000 });
    await page.waitForSelector(
      '[data-testid="wb-missing"], [data-testid="wb-missing-none"]',
      {
        timeout: 10000,
      }
    );

    const nav: string[] = await page.$$eval(
      '[data-testid="wb-nav"] a',
      (els: Element[]) => els.map((e) => (e.textContent ?? '').trim())
    );
    if (JSON.stringify(nav) !== JSON.stringify(EXPECTED_NAV)) {
      failures.push(
        `nav is ${JSON.stringify(nav)}, expected ${JSON.stringify(
          EXPECTED_NAV
        )}`
      );
    }

    const missing: string[] = await page.$$eval(
      '[data-testid="wb-missing"] li',
      (els: Element[]) => els.map((e) => (e.textContent ?? '').trim())
    );
    if (missing.includes('index.json'))
      failures.push('Storybook index.json was not found');
    console.log(
      `nav: ${nav.length} entries; data files missing: ${
        missing.join(', ') || 'none'
      }`
    );

    if (screenshot) {
      await page.screenshot({ path: path.resolve(screenshot), fullPage: true });
      console.log(`screenshot: ${path.resolve(screenshot)}`);
    }

    // Every route renders its own page (hash changes are same-document
    // navigations, so wait for the expected heading, not just any h1).
    for (const [hash, heading] of ROUTES) {
      await page.goto(`${base}/workbench/${hash}`);
      await page.waitForFunction(
        (h: string) => document.querySelector('main h1')?.textContent === h,
        heading,
        { timeout: 5000 }
      );
    }

    if (!storyId) {
      failures.push('index.json has no components-button story');
    } else {
      await canvasChecks(page, base, storyId, failures, canvasScreenshot);
    }
  } catch (e) {
    failures.push(`smoke run failed: ${(e as Error).message}`);
  } finally {
    await browser.close();
    server.close();
  }

  if (failures.length) {
    failures.forEach((f) => console.error(`FAIL ${f}`));
    process.exit(1);
  }
  console.log('workbench smoke: ok');
};

if (require.main === module) {
  main();
}
