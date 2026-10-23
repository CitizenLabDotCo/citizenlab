// Smoke test of the workbench shell inside a built Storybook.
//
//   npm run ds:smoke -- [--dir storybook-static] [--screenshot <file.png>]
//                       [--canvas-screenshot <file.png>]
//                       [--colour-screenshot <file.png>]
//                       [--spacing-screenshot <file.png>]
//
// Serves the static dir on a free local port, opens /workbench/#/start in
// Chromium and checks that the nav lists every section, the Start here page
// renders and nothing is logged as a console error. Optional data files that
// a build may lack (see OPTIONAL_DATA) are allowed to 404. Then opens a
// Button story on the canvas: the mode toolbar puts data-gv-mode on the
// frame's root, a share link override changes the button's computed
// border-radius, and a bad share link shows a notice and keeps the
// session. The Foundations colour page lists at least MIN_COLOUR_TOKENS
// tokens and a contrast pairs table with rows; an edit of a radius token
// shows in the Changes drawer and in the hash. The Components gallery shows
// at least MIN_GALLERY_THUMBS story thumbnails; the Button page has at least
// MIN_STATE_TABS story tabs, and switching its `disabled` control changes
// the frame's DOM. The canvas fits the Button frame to the story by
// default (MAX_FIT_HEIGHT). The Usage panel lists at least one back office
// (admin) route and the Tokens panel shows the radius token as linked.
// Exits 1 on failure,
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
  ['#/foundations/color', 'Colour'],
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

// Story ids are components-<category>-button--<story> (or without a category).
const BUTTON_STORY = /^components-([a-z0-9]+-)*button--/;

// A Button story from the build's index.json, primary first.
export const pickButtonStory = (index: unknown): string | null => {
  const entries = Object.values(
    (index as { entries?: Record<string, { id: string; type?: string }> })
      ?.entries ?? {}
  ).filter((e) => e.type === 'story' && BUTTON_STORY.test(e.id));
  return (
    entries.find((e) => e.id.endsWith('-button--primary'))?.id ??
    entries[0]?.id ??
    null
  );
};

// The share-link payload the shell reads (base64url JSON).
const sharePayload = (o: Record<string, string>) =>
  Buffer.from(JSON.stringify(o), 'utf8').toString('base64url');

export const MIN_COLOUR_TOKENS = 50;
export const MIN_GALLERY_THUMBS = 30;
export const MIN_STATE_TABS = 2;
// A Button story fitted to its frame: far shorter than any preset viewport.
export const MAX_FIT_HEIGHT = 400;

// The token names in a share-link hash (`...?o=<base64url JSON>`).
export const overrideNamesOfHash = (hash: string): string[] => {
  const q = hash.indexOf('?');
  const o = q === -1 ? null : new URLSearchParams(hash.slice(q + 1)).get('o');
  if (!o) return [];
  try {
    return Object.keys(
      JSON.parse(Buffer.from(o, 'base64url').toString('utf8'))
    );
  } catch {
    return [];
  }
};

const foundationsChecks = async (
  page: any,
  base: string,
  failures: string[],
  shots: { colour?: string; spacing?: string }
) => {
  await page.goto(`${base}/workbench/#/foundations/color`);
  await page.waitForSelector('[data-testid="wb-token-row"]', {
    timeout: 10000,
  });
  const colours: number = await page.$$eval(
    '[data-testid="wb-token-row"]',
    (els: Element[]) => els.length
  );
  if (colours < MIN_COLOUR_TOKENS) {
    failures.push(
      `the colour page lists ${colours} tokens, expected ${MIN_COLOUR_TOKENS} or more`
    );
  }
  let pairs = 0;
  try {
    await page.waitForSelector('[data-testid="wb-pair-row"]', {
      timeout: 15000,
    });
    pairs = await page.$$eval(
      '[data-testid="wb-pair-row"]',
      (els: Element[]) => els.length
    );
  } catch {
    failures.push('the colour page has no contrast pairs');
  }
  console.log(`foundations: ${colours} colour tokens, ${pairs} pairs`);
  if (shots.colour) {
    await page.screenshot({ path: path.resolve(shots.colour) });
    console.log(`colour screenshot: ${path.resolve(shots.colour)}`);
  }

  await page.goto(`${base}/workbench/#/foundations/space`);
  await page.waitForSelector('[data-testid="wb-token-row"]', {
    timeout: 10000,
  });
  if (shots.spacing) {
    await page.screenshot({ path: path.resolve(shots.spacing) });
    console.log(`spacing screenshot: ${path.resolve(shots.spacing)}`);
  }

  // Edit a radius token: it shows in the Changes drawer and the hash.
  await page.goto(`${base}/workbench/#/foundations/radius`);
  const input = `[data-testid="wb-token-row"][data-token="${RADIUS_TOKEN}"] [data-testid="wb-token-input"]`;
  await page.waitForSelector(input, { timeout: 10000 });
  await page.fill(input, '12px');
  await page.press(input, 'Enter');
  try {
    await page.waitForFunction(
      () => window.location.hash.includes('?o='),
      undefined,
      { timeout: 5000 }
    );
  } catch {
    // Reported below.
  }
  const hash: string = await page.evaluate(() => window.location.hash);
  if (!overrideNamesOfHash(hash).includes(RADIUS_TOKEN)) {
    failures.push(`a Foundations edit of ${RADIUS_TOKEN} is not in the hash`);
  }
  await page.click('[data-testid="wb-changes-toggle"]');
  const row = `[data-testid="wb-change-row"][data-token="${RADIUS_TOKEN}"]`;
  if (!(await page.isVisible(row))) {
    failures.push(`the Changes drawer does not list ${RADIUS_TOKEN}`);
  } else {
    console.log(`foundations: ${RADIUS_TOKEN} edit in the drawer and the hash`);
  }
  // Leave no session behind for the canvas checks.
  await page.click('[data-testid="wb-changes"] button:has-text("Reset all")');
};

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

// The canvas frame once it shows the given mode global ('' for any).
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
  await page.waitForSelector('[data-testid="wb-component"] h1', {
    timeout: 10000,
  });
  if (!(await page.isVisible('aside[aria-label="Panels"] [role="tablist"]'))) {
    failures.push('the panel column is not shown on a component page');
  }
  await canvasFrame(page, 'today');

  // Fit, the default viewport: the frame hugs the button, at full size.
  try {
    await page.waitForSelector(
      'iframe[data-testid="wb-canvas"][data-fit="done"]',
      {
        timeout: 10000,
      }
    );
    const box = await page.$eval(
      'iframe[data-testid="wb-canvas"]',
      (el: Element) => el.getBoundingClientRect().height
    );
    if (box > MAX_FIT_HEIGHT) {
      failures.push(
        `fit: the Button frame is ${box}px tall, expected ${MAX_FIT_HEIGHT} or less`
      );
    } else {
      console.log(`canvas: fit to story, ${Math.round(box)}px tall`);
    }
  } catch {
    failures.push('fit: the canvas frame was never fitted to the story');
  }

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

const galleryChecks = async (page: any, base: string, failures: string[]) => {
  await page.goto(`${base}/workbench/#/components`);
  await page.waitForSelector('[data-testid="wb-thumb"]', { timeout: 10000 });
  const thumbs: number = await page.$$eval(
    '[data-testid="wb-thumb"]',
    (els: Element[]) => els.length
  );
  if (thumbs < MIN_GALLERY_THUMBS) {
    failures.push(
      `the Components gallery shows ${thumbs} thumbnails, expected ${MIN_GALLERY_THUMBS} or more`
    );
  }
  console.log(`gallery: ${thumbs} component thumbnails`);
};

// Story tabs, then a boolean control: the frame's story renders again with
// the new arg.
const controlsChecks = async (
  page: any,
  base: string,
  storyId: string,
  failures: string[]
) => {
  await page.goto(`${base}/workbench/#/components/${storyId}`);
  await page.waitForSelector('[data-testid="wb-state-tab"]', {
    timeout: 10000,
  });
  const tabs: number = await page.$$eval(
    '[data-testid="wb-state-tab"]',
    (els: Element[]) => els.length
  );
  if (tabs < MIN_STATE_TABS) {
    failures.push(
      `the Button page has ${tabs} story tabs, expected ${MIN_STATE_TABS} or more`
    );
  }
  // Any mode: the toolbar keeps the one the canvas checks left.
  const frame = await canvasFrame(page, '');
  await page.waitForSelector('[data-testid="wb-controls-reset"]', {
    timeout: 20000,
  });
  const more = '[data-testid="wb-controls-more"][aria-expanded="false"]';
  if (await page.isVisible(more)) await page.click(more);
  const toggle =
    '[data-testid="wb-control"][data-arg="disabled"][data-kind="boolean"] input';
  if (!(await page.isVisible(toggle))) {
    failures.push('the Button page has no disabled control');
    return;
  }
  const before: string = await frame.$eval(
    '#storybook-root',
    (el: Element) => el.innerHTML
  );
  await page.click(toggle);
  try {
    await frame.waitForFunction(
      (html: string) =>
        document.querySelector('#storybook-root')?.innerHTML !== html,
      before,
      { timeout: 5000 }
    );
    console.log(`controls: ${tabs} story tabs; disabled changes the frame`);
  } catch {
    failures.push('switching the disabled control left the frame unchanged');
  }
};

// The Usage and Tokens tabs of the Button page's panel.
const panelChecks = async (
  page: any,
  base: string,
  storyId: string,
  failures: string[]
) => {
  await page.goto(`${base}/workbench/#/components/${storyId}`);
  await page.click('[data-testid="wb-panel-tab"][data-tab="usage"]');
  const admin = '[data-testid="wb-usage-route"][data-office="admin"]';
  let routes = 0;
  try {
    await page.waitForSelector(admin, { timeout: 20000 });
    routes = await page.$$eval(admin, (els: Element[]) => els.length);
  } catch {
    failures.push('the Usage panel lists no back office route for Button');
  }
  await page.click('[data-testid="wb-panel-tab"][data-tab="tokens"]');
  const chip = `[data-testid="wb-panel-tokens"] [data-token="${RADIUS_TOKEN}"] [data-testid="wb-token-match"]`;
  let match: string | null = null;
  try {
    await page.waitForSelector(chip, { timeout: 20000 });
    match = await page.$eval(chip, (el: Element) =>
      el.getAttribute('data-match')
    );
  } catch {
    // Reported below.
  }
  if (match !== 'linked') {
    failures.push(
      `the Tokens panel shows ${RADIUS_TOKEN} as ${
        match ?? 'missing'
      }, expected linked`
    );
  }
  // A row's heal names that row's token, even when the legacy name it
  // heals maps to more tokens.
  const row = `[data-testid="wb-panel-tokens"] [data-token="${RADIUS_TOKEN}"]`;
  let heal = '';
  if (await page.$(`${row} [data-testid="wb-heal"]`)) {
    await page.click(`${row} [data-testid="wb-heal"]`);
    await page.waitForSelector(`${row} [data-testid="wb-heal-text"] pre`);
    heal = await page.$eval(
      `${row} [data-testid="wb-heal-text"] pre`,
      (el: Element) => el.textContent ?? ''
    );
    const targets = [...heal.matchAll(/→ (.+?) · mode/g)].map((m) => m[1]);
    if (!targets.length || targets.some((t) => t !== RADIUS_TOKEN)) {
      failures.push(
        `the ${RADIUS_TOKEN} heal targets ${targets.join(', ') || 'nothing'}`
      );
    }
  }
  console.log(
    `panels: ${routes} back office routes shown in Usage; ${RADIUS_TOKEN} ${match} in Tokens${
      heal ? `, its heal names only ${RADIUS_TOKEN}` : ''
    }`
  );
};

const main = async () => {
  const root = path.resolve(arg('dir') ?? 'storybook-static');
  const screenshot = arg('screenshot');
  const canvasScreenshot = arg('canvas-screenshot');
  const colourScreenshot = arg('colour-screenshot');
  const spacingScreenshot = arg('spacing-screenshot');
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

    await foundationsChecks(page, base, failures, {
      colour: colourScreenshot,
      spacing: spacingScreenshot,
    });

    await galleryChecks(page, base, failures);

    if (!storyId) {
      failures.push('index.json has no Button story');
    } else {
      await canvasChecks(page, base, storyId, failures, canvasScreenshot);
      await controlsChecks(page, base, storyId, failures);
      await panelChecks(page, base, storyId, failures);
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
