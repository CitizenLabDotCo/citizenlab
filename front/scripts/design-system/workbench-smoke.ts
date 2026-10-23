// Smoke test of the workbench shell inside a built Storybook.
//
//   npm run ds:smoke -- [--dir storybook-static] [--screenshot <file.png>]
//                       [--canvas-screenshot <file.png>]
//                       [--colour-screenshot <file.png>]
//                       [--spacing-screenshot <file.png>]
//                       [--review-host <https://platform origin>]
//
// Serves the static dir on a free local port, opens /workbench/#/start in
// Chromium and checks that the nav lists every section, the Start here page
// renders (its tour links to every section, the needs-a-person list shows)
// and nothing is logged as a console error. Optional data files that
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
// The Review page lists at least MIN_ADMIN_ROUTES back office routes and
// shows "needs a record" for a route whose param the fixture lacks. With
// --review-host <platform origin> (an epic serving this Storybook under
// /storybook/), the build is served at that origin by request interception
// so the platform frames are same origin: the admin/projects frames load
// (ok, or login with the login hint) without the cookie modal, the After
// frame carries a token edit
// and Before does not, and the highlight counts tagged instances (shows
// its note on an untagged build, then counts injected ones).
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

// Start here's tour links to every section but itself, in nav order.
export const EXPECTED_TOUR = [
  '#/foundations',
  '#/components',
  '#/patterns',
  '#/pages',
  '#/review',
  '#/proposal',
];

// What is wrong with the tour's links, or null.
export const tourProblem = (hrefs: string[]): string | null => {
  const hashes = hrefs.map((h) => h.replace(/^.*(#\/)/, '$1'));
  return JSON.stringify(hashes) === JSON.stringify(EXPECTED_TOUR)
    ? null
    : `Start here tour links ${JSON.stringify(
        hashes
      )}, expected ${JSON.stringify(EXPECTED_TOUR)}`;
};

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

// Start here: the tour links to each section, the needs-a-person list (or
// its empty state) renders, and the mode rule names the token commit.
const startHereChecks = async (page: any, failures: string[]) => {
  const hrefs: string[] = await page.$$eval(
    '[data-testid="wb-tour"] a',
    (els: Element[]) => els.map((e) => e.getAttribute('href') ?? '')
  );
  const tour = tourProblem(hrefs);
  if (tour) failures.push(tour);

  const needs: number = await page.$$eval(
    '[data-testid="wb-needs-human"] li',
    (els: Element[]) => els.length
  );
  const none = await page.$('[data-testid="wb-needs-human-none"]');
  if (needs === 0 && !none) {
    failures.push('Start here shows no needs-a-person list');
  }

  const rule: string =
    (await page.textContent('[data-testid="wb-rule-today"]')) ?? '';
  if (!/even with mode both/.test(rule) || !/token commit/.test(rule)) {
    failures.push(`Start here mode rule reads "${rule.trim()}"`);
  }
  console.log(
    `start here: tour ${hrefs.length} links; needs a person ${needs}`
  );
};

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
  '/routes.fixture.json',
  // The Review page's login probe; a static server has no platform API.
  '/web_api/v1/users/me',
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
    // The panel reads the frame again on each storyRendered; a read of a
    // half-rendered story is replaced, so wait for the value, not the chip.
    await page.waitForFunction(
      (sel: string) =>
        document.querySelector(sel)?.getAttribute('data-match') === 'linked',
      chip,
      { timeout: 20000 }
    );
  } catch {
    // Reported below with the last value.
  }
  match = await page
    .$eval(chip, (el: Element) => el.getAttribute('data-match'))
    .catch(() => null);
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
  if (!(await page.$(`${row} [data-testid="wb-heal"]`))) {
    failures.push(
      `the ${RADIUS_TOKEN} row in the Tokens panel has no Heal button`
    );
  } else {
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

  // The A11y tab: Button's checklist badge with its date and counts.
  await page.click('[data-testid="wb-panel-tab"][data-tab="a11y"]');
  let reviewed = '';
  try {
    await page.waitForSelector('[data-testid="wb-a11y-reviewed"]', {
      timeout: 10000,
    });
    reviewed = await page.$eval(
      '[data-testid="wb-a11y-reviewed"]',
      (el: Element) => (el as HTMLElement).innerText.replace(/\s+/g, ' ')
    );
  } catch {
    // Reported below.
  }
  if (!A11Y_REVIEWED.test(reviewed)) {
    failures.push(
      `the A11y panel shows "${
        reviewed || 'nothing'
      }" for Button, expected "reviewed ... on <date>" and a count`
    );
  }
  const panelText: string = await page
    .$eval('[data-testid="wb-panel-a11y"]', (el: Element) => el.textContent)
    .catch(() => '');
  if (/complian|certified/i.test(panelText)) {
    failures.push('the A11y panel claims compliance or certification');
  }
  console.log(`a11y: ${reviewed}`);
};

// "Reviewed by agent on 23 Oct 2026 8 pass 1 fail 0 need a person".
export const A11Y_REVIEWED =
  /reviewed (by \S+ )?on \d{1,2} \w{3} \d{4}.*\d+ pass/i;

export const MIN_ADMIN_ROUTES = 20;

// The Proposal page's live mode demo (Proposal.tsx SPLIT_STORY).
const PROPOSAL_SPLIT_STORY = 'components-data-display-quote--default';

// The Proposal page: the big numbers are the build's summary, the trend
// charts draw a line through every commit, and Quote shows its corners
// change between the two modes.
const proposalChecks = async (
  page: any,
  base: string,
  root: string,
  failures: string[]
) => {
  await page.goto(`${base}/workbench/#/proposal`);
  await page.waitForSelector('[data-testid="wb-proposal"]', {
    timeout: 10000,
  });
  let summary: Record<string, unknown> = {};
  try {
    summary = JSON.parse(
      fs.readFileSync(path.join(root, 'design-scan.summary.json'), 'utf8')
    );
  } catch {
    failures.push('proposal: design-scan.summary.json missing in the build');
  }
  for (const key of ['offSpec', 'legacy']) {
    const want = summary[key];
    const shown: string | null = await page
      .$eval(
        `[data-testid="wb-prop-number"] [data-key="${key}"]`,
        (el: Element) => el.textContent
      )
      .catch(() => null);
    if (typeof want !== 'number' || shown?.replace(/,/g, '') !== `${want}`) {
      failures.push(
        `proposal: ${key} shows ${JSON.stringify(shown)}, summary has ${want}`
      );
    }
  }
  const charts = await page
    .waitForSelector('[data-testid="wb-prop-chart"] path.wb-prop-line', {
      timeout: 5000,
    })
    .then(() =>
      page.$$eval('[data-testid="wb-prop-chart"]', (els: Element[]) =>
        els.map((el) => ({
          segments: (
            el.querySelector('path.wb-prop-line')?.getAttribute('d') ?? ''
          ).split('L').length,
          dots: el.querySelectorAll('circle.wb-prop-dot').length,
        }))
      )
    )
    .catch(() => []);
  if (charts.length < 2 || charts.some((c: any) => c.segments < 2)) {
    failures.push(
      `proposal: expected two trend lines, got ${JSON.stringify(charts)}`
    );
  }
  const order = await page.$$eval(
    '[data-testid="wb-prop-order"] li',
    (els: Element[]) => els.length
  );
  if (order === 0) failures.push('proposal: migration order is empty');
  const frames = await page.$$eval(
    '[data-testid="wb-prop-split"] iframe[data-testid="wb-canvas"]',
    (els: Element[]) => els.map((e) => e.getAttribute('src') ?? '')
  );
  let radii: string[] = [];
  if (
    frames.length !== 2 ||
    !frames.every((f: string) => f.includes(PROPOSAL_SPLIT_STORY)) ||
    !frames[0].includes('mode:today') ||
    !frames[1].includes('mode:redesign')
  ) {
    failures.push(
      `proposal: expected Quote frames in today and redesign, got ${JSON.stringify(
        frames
      )}`
    );
  } else {
    const handles = await page.$$(
      '[data-testid="wb-prop-split"] iframe[data-testid="wb-canvas"]'
    );
    radii = await Promise.all(
      handles.map(async (h: any) => {
        const frame = await h.contentFrame();
        const quote = await frame
          .waitForSelector('#storybook-root blockquote', { timeout: 20000 })
          .catch(() => null);
        return quote
          ? frame.$eval(
              '#storybook-root blockquote',
              (el: Element) => getComputedStyle(el).borderTopLeftRadius
            )
          : 'missing';
      })
    );
    if (radii.includes('missing') || radii[0] === radii[1]) {
      failures.push(
        `proposal: Quote corners should differ between the modes, got ${radii.join(
          ' and '
        )}`
      );
    }
  }
  console.log(
    `proposal: offSpec ${summary.offSpec}, ${charts.length} charts (${charts
      .map((c: any) => c.dots)
      .join(', ')} points), ${order} components in the order; Quote ${
      radii[0] ?? '?'
    } -> ${radii[1] ?? '?'}`
  );
};

// A route with a param the fixture has no record for (fixture.missing).
const NEEDS_RECORD_ROUTE = 'admin/projects/$projectId/analysis/$analysisId';
const REVIEW_ROUTE = 'admin/projects';
const FRAME_TIMEOUT = 45000;
const REDIRECT_WAIT = 8000;

const reviewHashFor = (route: string, extra = '') =>
  `#/review?route=${encodeURIComponent(route)}${extra}`;

// Checks that need no platform: the route list and the needs-record state.
const reviewChecks = async (page: any, base: string, failures: string[]) => {
  await page.goto(`${base}/workbench/#/review`);
  await page.waitForSelector('[data-testid="wb-review-route"]', {
    timeout: 15000,
  });
  const admin: number = await page.$$eval(
    '[data-testid="wb-review-route"][data-office="admin"]',
    (els: Element[]) => els.length
  );
  if (admin < MIN_ADMIN_ROUTES) {
    failures.push(
      `review lists ${admin} back office routes, expected ${MIN_ADMIN_ROUTES}+`
    );
  }
  await page.goto(`${base}/workbench/${reviewHashFor(NEEDS_RECORD_ROUTE)}`);
  try {
    await page.waitForSelector('[data-testid="wb-review-needs-record"]', {
      timeout: 5000,
    });
    console.log(`review: ${admin} back office routes, needs-record state`);
  } catch {
    failures.push(`review: ${NEEDS_RECORD_ROUTE} does not ask for a record`);
  }
};

const frameOf = async (page: any, side: 'before' | 'after') =>
  (
    await page.waitForSelector(`[data-testid="wb-frame-${side}-iframe"]`)
  ).contentFrame();

// The platform frames, with the build served at `host`/storybook/.
const reviewFrameChecks = async (
  browser: any,
  root: string,
  host: string,
  failures: string[]
) => {
  const origin = new URL(host).origin;
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  try {
    await context.route(`${origin}/storybook/**`, async (route: any) => {
      const rel = new URL(route.request().url()).pathname.replace(
        /^\/storybook/,
        ''
      );
      let file = resolveStaticPath(root, rel || '/');
      if (file && fs.existsSync(file) && fs.statSync(file).isDirectory()) {
        file = path.join(file, 'index.html');
      }
      if (!file || !fs.existsSync(file)) {
        await route.fulfill({ status: 404, body: 'not found' });
        return;
      }
      let body: Buffer | string = fs.readFileSync(file);
      if (path.basename(file) === 'routes.fixture.json') {
        const fixture = JSON.parse(body.toString('utf8'));
        fixture.hosts = { ...fixture.hosts, after: origin };
        body = JSON.stringify(fixture);
      }
      await route.fulfill({
        status: 200,
        body,
        contentType: TYPES[path.extname(file)] ?? 'application/octet-stream',
      });
    });
    const page = await context.newPage();
    page.on('pageerror', (err: Error) =>
      failures.push(`review page error: ${err.message}`)
    );
    const edit = `&o=${sharePayload({ [RADIUS_TOKEN]: RADIUS_OVERRIDE })}`;
    await page.goto(
      `${origin}/storybook/workbench/${reviewHashFor(
        REVIEW_ROUTE,
        `&component=Button${edit}`
      )}`
    );
    await page.waitForSelector('[data-testid="wb-frame-after"]', {
      timeout: 15000,
    });
    const settled = async (side: string): Promise<string> => {
      const handle = await page.waitForFunction(
        (s: string) => {
          const st = document.querySelector<HTMLElement>(
            `[data-testid="wb-frame-${s}"]`
          )?.dataset.state;
          return st && st !== 'loading' && st !== 'blank' ? st : false;
        },
        side,
        { timeout: FRAME_TIMEOUT }
      );
      return handle.jsonValue();
    };
    await settled('before');
    await settled('after');
    // The platform redirects a visitor without admin rights after it boots.
    await page.waitForTimeout(REDIRECT_WAIT);
    const states = [await settled('before'), await settled('after')];
    states.forEach((st, i) => {
      if (st !== 'ok' && st !== 'login') {
        failures.push(
          `review: the ${
            i ? 'After' : 'Before'
          } frame of /${REVIEW_ROUTE} is ${st}`
        );
      }
    });
    if (states.includes('login')) {
      if (!(await page.$('[data-testid="wb-login-hint"]'))) {
        failures.push('review: a frame shows the login page without the hint');
      }
    }

    // The cookie modal is declined in both frames.
    for (const side of ['before', 'after'] as const) {
      const modal = await (
        await frameOf(page, side)
      ).$('[data-testid="consent-manager"]');
      if (modal && (await modal.isVisible())) {
        failures.push(`review: the cookie modal covers the ${side} frame`);
      }
    }

    const radius = (side: 'before' | 'after') =>
      frameOf(page, side).then((f: any) =>
        f.evaluate(
          (n: string) =>
            document.documentElement.style.getPropertyValue(n).trim(),
          RADIUS_TOKEN
        )
      );
    // Edits go on at load and on every poll.
    await page.waitForTimeout(1500);
    const [before, after] = [await radius('before'), await radius('after')];
    if (after !== RADIUS_OVERRIDE) {
      failures.push(
        `review: After has ${RADIUS_TOKEN} "${after}", expected ${RADIUS_OVERRIDE}`
      );
    }
    if (before === RADIUS_OVERRIDE) {
      failures.push(`review: Before carries the ${RADIUS_TOKEN} edit`);
    }

    const note = async () =>
      page.$eval('[data-testid="wb-review-highlight-note"]', (el: Element) => ({
        text: el.textContent ?? '',
        count: Number((el as HTMLElement).dataset.count ?? 0),
      }));
    const untagged = (await note()).text;
    const afterFrame = await frameOf(page, 'after');
    const tagged = await afterFrame.evaluate(
      () => !!document.querySelector('[data-gv-component]')
    );
    if (!tagged && !/does not tag/.test(untagged)) {
      failures.push(`review: untagged build without the note ("${untagged}")`);
    }
    await afterFrame.evaluate(() => {
      const el = document.createElement('button');
      el.setAttribute('data-gv-component', 'Button');
      el.textContent = 'Tagged';
      document.body.appendChild(el);
    });
    const toggle = '[data-testid="wb-review-highlight"]';
    await page.waitForSelector(`${toggle}:not([disabled])`, { timeout: 5000 });
    if (!(await page.$eval(toggle, (el: HTMLInputElement) => el.checked))) {
      await page.click(toggle);
    }
    try {
      await page.waitForFunction(
        () =>
          Number(
            document.querySelector<HTMLElement>(
              '[data-testid="wb-review-highlight-note"]'
            )?.dataset.count ?? 0
          ) >= 1,
        undefined,
        { timeout: 5000 }
      );
    } catch {
      failures.push('review: the highlight does not count tagged Buttons');
    }
    console.log(
      `review: /${REVIEW_ROUTE} frames ${states.join('/')} on ${origin}, ` +
        `edit on After only, highlight ${tagged ? 'tagged' : 'untagged build'}`
    );
  } finally {
    await context.close();
  }
};

const main = async () => {
  const root = path.resolve(arg('dir') ?? 'storybook-static');
  const screenshot = arg('screenshot');
  const canvasScreenshot = arg('canvas-screenshot');
  const colourScreenshot = arg('colour-screenshot');
  const spacingScreenshot = arg('spacing-screenshot');
  const reviewHost = arg('review-host');
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
    if (missing.includes('index.json')) {
      failures.push('Storybook index.json was not found');
    }
    console.log(
      `nav: ${nav.length} entries; data files missing: ${
        missing.join(', ') || 'none'
      }`
    );

    await startHereChecks(page, failures);

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

    await proposalChecks(page, base, root, failures);

    await reviewChecks(page, base, failures);
    if (reviewHost) {
      await reviewFrameChecks(browser, root, reviewHost, failures);
    } else {
      console.log('review: no --review-host, platform frame checks skipped');
    }

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
