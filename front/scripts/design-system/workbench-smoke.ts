// Smoke test of the workbench shell inside a built Storybook.
//
//   npm run ds:smoke -- [--dir storybook-static] [--screenshot <file.png>]
//                       [--canvas-screenshot <file.png>]
//                       [--colour-screenshot <file.png>]
//                       [--spacing-screenshot <file.png>]
//
// Serves the static dir on a free local port, opens /workbench/ in Chromium
// and checks that the default route is Components (`#/components`, also for
// the old `#/start`), the nav lists every section with Components current,
// and nothing is logged as a console error. Optional data files that a build
// may lack (see OPTIONAL_DATA) are allowed to 404. `#/foundations` lands on
// the Colour page with no overview cards or breadcrumb. Then opens a
// Button story on the canvas: a share link override reaches the frame's
// radius token, and a bad share link shows a notice and keeps the
// session. The Foundations colour page lists at least MIN_COLOUR_TOKENS
// tokens and a contrast pairs table with rows. On the Radius page the
// radius token's Value field (Detach first, when it reads from another
// token) steps by 1px on ArrowUp and the row's preview follows;
// a typed value shows in the Changes drawer and in the hash. The Shadow
// page opens a shadow token's layer editor, a Drop shadow with X, Y, Blur,
// Spread, Color and opacity fields, and ArrowUp on Blur reaches the row's
// preview. The Components gallery shows
// at least MIN_GALLERY_THUMBS story thumbnails, rendered in one shared
// preview frame: at least MIN_REVEALED_THUMBS reveal their story, the
// first sits over its card within 1px, and a card the frame cannot show
// renders in a frame of its own (no other card has one); the Button page's
// State and Variant menus offer at least MIN_STATE_TABS stories, another
// State switches the story in the same canvas frame (the element is not
// remounted, the preview's current story is the chosen one, the session's
// radius edit stays on it), as do another city and language: the
// iframe element and its document stay (a marker set in the frame
// survives, so the preview did not reload itself), no held copy of the old
// story is left, and the story's DOM shows the new global (the city's
// tenant tokens, Arabic's right-to-left body).
// Switching the `disabled` control then changes the frame's DOM, and a
// burst of edits of it made during a city switch waits for the switch: no
// reload, and the frame ends with the last edit and the new city; the same
// burst on a settled frame ends on the last click too. The canvas
// fits the Button frame to the story by default (MAX_FIT_HEIGHT). The Design tab
// selects the button and offers the radius token its corner radius equals
// (or links it); a click on the canvas selects the element under it; Size's
// attach suggestion turns it into a --gv-fs-s pill and the Changes badge
// counts it; 12 typed into the vertical padding becomes a --gv-space-3
// pill; Copy for agent names --gv-fs-s; Reset all clears the list. The
// Usage tab lists at least one back office (admin) route.
// The Review page shows as many change cards as design-changes.json has
// design changes, or its empty state.
// Exits 1 on failure,
// 2 when Playwright is missing. Playwright is loaded through ./playwright.
import fs from 'fs';
import http from 'http';
import { AddressInfo } from 'net';
import path from 'path';

import { loadPlaywright } from './playwright';

export const EXPECTED_NAV = [
  'Foundations',
  'Components',
  'Patterns',
  'Pages',
  'Review',
];

const ROUTES: [string, string][] = [
  ['#/foundations/color', 'Colour'],
  ['#/components', 'Components'],
  ['#/patterns', 'Patterns'],
  ['#/pages', 'Pages'],
  ['#/review', 'Review'],
];

// The canvas checks need a story whose radius goes through the theme bridge
// (theme.borderRadius is var(--gv-radius-control, 3px)).
const RADIUS_TOKEN = '--gv-radius-control';
const RADIUS_OVERRIDE = '20px';
// The shadow token whose layers the Foundations check opens.
const SHADOW_TOKEN = '--gv-shadow-menu';
const SHADOW_FIELDS = ['x', 'y', 'blur', 'spread', 'color', 'alpha'];

// The Design tab's checks: Size is hard-coded at --gv-fs-s, and 12 typed
// into the vertical padding snaps to --gv-space-3.
const SIZE_TOKEN = '--gv-fs-s';
const SNAP_TOKEN = '--gv-space-3';

// Hashes that open another page, and the hash each is replaced with.
export const REDIRECTS: [string, string][] = [
  ['', '#/components'],
  ['#/start', '#/components'],
  ['#/foundations', '#/foundations/color'],
];

// The hash of a page URL (`http://x/workbench/#/a` is `#/a`), '' for none.
export const hashOf = (url: string): string => {
  const i = url.indexOf('#');
  return i === -1 ? '' : url.slice(i);
};

// Each redirect replaces the hash and shows its page's heading; Foundations
// shows no overview cards or breadcrumb.
const redirectChecks = async (page: any, base: string, failures: string[]) => {
  for (const [from, to] of REDIRECTS) {
    await page.goto(`${base}/workbench/${from}`);
    const heading = ROUTES.find(([h]) => h === to)?.[1];
    // The URL first: the previous page may already show the same heading.
    try {
      await page.waitForURL((u: URL) => hashOf(u.toString()) === to, {
        timeout: 5000,
      });
    } catch {
      // Reported below with the hash it ended on.
    }
    try {
      await page.waitForFunction(
        (h: string) => document.querySelector('main h1')?.textContent === h,
        heading,
        { timeout: 5000 }
      );
    } catch {
      failures.push(`/workbench/${from} does not open ${heading}`);
    }
    const now = hashOf(page.url());
    if (now !== to) {
      failures.push(`/workbench/${from} ends on "${now}", expected ${to}`);
    }
  }
  if (await page.$('[data-testid="wb-categories"], main .wb-crumbs')) {
    failures.push('Foundations still shows overview cards or a breadcrumb');
  }
  console.log(`redirects: ${REDIRECTS.length} checked`);
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
// Thumbnails that must reveal their story (the first rows of the gallery).
export const MIN_REVEALED_THUMBS = 12;
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

  // Edit a radius token in its Value field. ArrowUp steps it by 1px and
  // the row's preview follows; a typed value shows in the Changes drawer
  // and the hash.
  await page.goto(`${base}/workbench/#/foundations/radius`);
  const radiusRow = `[data-testid="wb-token-row"][data-token="${RADIUS_TOKEN}"]`;
  const input = `${radiusRow} [data-testid="wb-token-input"]`;
  await page.waitForSelector(
    `${radiusRow} [data-testid="wb-token-input"], ${radiusRow} [data-testid="wb-token-alias"]`,
    { timeout: 10000 }
  );
  if (!(await page.$(input))) {
    // It reads another token: Detach gives it a field.
    await page.click(`${radiusRow} [data-testid="wb-token-detach"]`);
  }
  await page.waitForSelector(input, { timeout: 10000 });
  const fromPx = parseFloat(await page.inputValue(input));
  await page.focus(input);
  await page.press(input, 'ArrowUp');
  const stepped = `${fromPx + 1}px`;
  const previewRadius = (): Promise<string> =>
    page.$eval(
      `${radiusRow} .wb-pv-radius > span`,
      (el: Element) => getComputedStyle(el).borderTopLeftRadius
    );
  try {
    await page.waitForFunction(
      ([sel, v]: string[]) => {
        const el = document.querySelector(sel);
        return !!el && getComputedStyle(el).borderTopLeftRadius === v;
      },
      [`${radiusRow} .wb-pv-radius > span`, stepped],
      { timeout: 5000 }
    );
  } catch {
    // Reported below.
  }
  const steppedValue = await page.inputValue(input);
  const steppedPreview = await previewRadius();
  if (steppedValue !== stepped || steppedPreview !== stepped) {
    failures.push(
      `ArrowUp on ${RADIUS_TOKEN} (${fromPx}px): field "${steppedValue}", preview ${steppedPreview}, expected ${stepped}`
    );
  } else {
    console.log(
      `foundations: ArrowUp steps ${RADIUS_TOKEN} ${fromPx}px -> ${stepped}, the preview follows`
    );
  }
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

  // The shadow page: a shadow token's layers open in the editor, with X,
  // Y, Blur, Spread and Color, and a step of Blur reaches the preview.
  if (await page.isVisible('[data-testid="wb-changes"]')) {
    await page.click('[data-testid="wb-changes"] button:has-text("Close")');
  }
  await page.goto(`${base}/workbench/#/foundations/shadow`);
  const shadowRow = `[data-testid="wb-token-row"][data-token="${SHADOW_TOKEN}"]`;
  const toggle = `${shadowRow} [data-testid="wb-shadow-toggle"]`;
  try {
    await page.waitForSelector(toggle, { timeout: 10000 });
    await page.click(toggle);
    await page.waitForSelector(`${shadowRow} [data-testid="wb-shadow-layer"]`, {
      timeout: 5000,
    });
  } catch {
    failures.push(`the shadow page has no layer editor for ${SHADOW_TOKEN}`);
    return;
  }
  const fields: string[] = await page.$$eval(
    `${shadowRow} [data-testid="wb-shadow-layer"] [data-field]`,
    (els: Element[]) => els.map((el) => el.getAttribute('data-field') ?? '')
  );
  const kind: string = await page.$eval(
    `${shadowRow} [data-testid="wb-shadow-layer"] select`,
    (el: Element) =>
      (el as HTMLSelectElement).selectedOptions[0]?.textContent ?? ''
  );
  const missing = SHADOW_FIELDS.filter((f) => !fields.includes(f));
  if (missing.length || kind !== 'Drop shadow') {
    failures.push(
      `the shadow editor of ${SHADOW_TOKEN} shows "${kind}" with fields ${fields.join(
        ', '
      )}, missing ${missing.join(', ') || 'none'}`
    );
  }
  const blur = `${shadowRow} [data-field="blur"] input`;
  const blurFrom = Number(await page.inputValue(blur));
  await page.press(blur, 'ArrowUp');
  try {
    await page.waitForFunction(
      ([sel, px]: string[]) => {
        const el = document.querySelector(sel);
        return !!el && getComputedStyle(el).boxShadow.includes(px);
      },
      [`${shadowRow} .wb-pv-shadow > span`, `${blurFrom + 1}px`],
      { timeout: 5000 }
    );
    console.log(
      `foundations: ${SHADOW_TOKEN} layer editor (${fields.join(
        ', '
      )}); Blur ${blurFrom} -> ${blurFrom + 1}px in the preview`
    );
  } catch {
    failures.push(
      `ArrowUp on the Blur of ${SHADOW_TOKEN} did not reach its preview`
    );
  }
  if (!(await page.isVisible('[data-testid="wb-changes"]'))) {
    await page.click('[data-testid="wb-changes-toggle"]');
  }
  await page.click('[data-testid="wb-changes"] button:has-text("Reset all")');
};

const OPTIONAL_DATA = [
  '/design-scan.json',
  '/design-changes.json',
  '/routes.fixture.json',
  '/design-scan.summary.json',
  // The Review page reads route params from the platform's API and the
  // pictures of each change; a static server has neither.
  '/web_api/v1/projects?page[size]=1',
  '/before.png',
  '/after.png',
  '/a11y-results.json',
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

const serve = (root: string, port = 0): Promise<http.Server> =>
  new Promise((resolve, reject) => {
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
    server.on('error', reject);
    server.listen(port, '127.0.0.1', () => resolve(server));
  });

// A setting on the floating bar: city and language are selects.
const SETTING = (key: string) =>
  `[data-testid="wb-float-bar"] [data-testid="wb-toolbar-${key}"]`;
const settingOf = async (
  page: any,
  key: string
): Promise<{ disabled: boolean; value: string; values: string[] }> =>
  page.$eval(SETTING(key), (el: Element) => {
    if (el instanceof HTMLSelectElement) {
      return {
        disabled: el.disabled,
        value: el.value,
        values: Array.from(el.options).map((o) => o.value),
      };
    }
    const buttons = Array.from(el.querySelectorAll('button[data-value]'));
    return {
      disabled: buttons.every((b) => (b as HTMLButtonElement).disabled),
      value:
        buttons
          .find((b) => b.getAttribute('aria-pressed') === 'true')
          ?.getAttribute('data-value') ?? '',
      values: buttons.map((b) => b.getAttribute('data-value') ?? ''),
    };
  });
const pickSetting = async (page: any, key: string, value: string) =>
  page.selectOption(SETTING(key), value);

// The canvas frame once its story has rendered.
const canvasFrame = async (page: any) => {
  const handle = await page.waitForSelector('iframe[data-testid="wb-canvas"]', {
    timeout: 10000,
  });
  const frame = await handle.contentFrame();
  await frame.waitForSelector('#storybook-root button', { timeout: 20000 });
  return frame;
};

// The token's value in the frame. The platform reads no token, so a token
// edit shows on the frame's root, where the workbench writes it.
const radiusOf = (frame: any): Promise<string> =>
  frame.evaluate(
    (name: string) =>
      getComputedStyle(document.documentElement).getPropertyValue(name).trim(),
    RADIUS_TOKEN
  );

const canvasChecks = async (
  page: any,
  base: string,
  storyId: string,
  failures: string[],
  screenshot?: string
) => {
  await page.goto(`${base}/workbench/#/components/${storyId}`);
  await page.waitForSelector(
    '[data-testid="wb-component"] [data-testid="wb-canvas-bar"]',
    { timeout: 10000 }
  );
  if (!(await page.isVisible('aside[aria-label="Panels"] [role="tablist"]'))) {
    failures.push('the panel column is not shown on a component page');
  }
  const frame = await canvasFrame(page);

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

  // Share link override: the token's value in the frame follows it.
  const before = await radiusOf(frame);
  const payload = sharePayload({ [RADIUS_TOKEN]: RADIUS_OVERRIDE });
  await page.evaluate((h: string) => {
    window.location.hash = h;
  }, `#/components/${storyId}?o=${payload}`);
  try {
    await frame.waitForFunction(
      ([name, v]: [string, string]) =>
        getComputedStyle(document.documentElement)
          .getPropertyValue(name)
          .trim() === v,
      [RADIUS_TOKEN, RADIUS_OVERRIDE],
      { timeout: 5000 }
    );
  } catch {
    failures.push(
      `override ${RADIUS_TOKEN}=${RADIUS_OVERRIDE}: the frame reads ${await radiusOf(
        frame
      )}`
    );
  }
  console.log(
    `canvas: ${storyId}; ${RADIUS_TOKEN} ${before} -> ${await radiusOf(frame)}`
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
      `a rejected share link changed the session: ${RADIUS_TOKEN} ${after}`
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
  // The cards render their stories in one preview frame over the grid, not
  // a frame each; the first ones reveal.
  const frames: number = await page.$$eval(
    '[data-testid="wb-gallery-frame"]',
    (els: Element[]) => els.length
  );
  if (frames !== 1) {
    failures.push(
      `the Components gallery has ${frames} gallery frames, expected 1`
    );
  }
  try {
    await page.waitForFunction(
      (min: number) =>
        document.querySelectorAll(
          '[data-testid="wb-thumb"][data-state="rendered"]'
        ).length >= min,
      MIN_REVEALED_THUMBS,
      { timeout: 30000 }
    );
  } catch {
    failures.push(
      `fewer than ${MIN_REVEALED_THUMBS} gallery thumbnails revealed their story`
    );
  }
  const shared = await page.evaluate(() => {
    const frame = document.querySelector<HTMLIFrameElement>(
      '[data-testid="wb-gallery-frame"]'
    );
    const doc = frame?.contentDocument;
    // Stories that painted something in a revealed card.
    const painted = Array.from(
      doc?.querySelectorAll('.gvg-item[data-shown]') ?? []
    ).filter((item) => item.querySelector('[data-gv-story-box] > *'));
    // The first one sits over its card's preview box: frame pixels, scaled
    // by the frame's scale, from the frame's corner.
    let offBy: number | null = null;
    const item = painted[0] as HTMLElement | undefined;
    const id = item?.dataset.gvThumb;
    const box = id
      ? document.querySelector<HTMLElement>(
          `[data-testid="wb-thumb"][data-story="${id}"] .wb-thumb`
        )
      : null;
    if (frame && item && box) {
      const f = frame.getBoundingClientRect();
      const k = f.width / frame.offsetWidth;
      const at = item.getBoundingClientRect();
      const own = box.getBoundingClientRect();
      offBy = Math.max(
        Math.abs(f.left + at.left * k - (own.left + box.clientLeft)),
        Math.abs(f.top + at.top * k - (own.top + box.clientTop)),
        Math.abs(at.width * k - box.clientWidth),
        Math.abs(at.height * k - box.clientHeight)
      );
    }
    return { painted: painted.length, id, offBy };
  });
  if (shared.painted < MIN_REVEALED_THUMBS) {
    failures.push(
      `the gallery frame painted ${shared.painted} stories, expected ${MIN_REVEALED_THUMBS} or more`
    );
  }
  if (shared.offBy === null || shared.offBy > 1) {
    failures.push(
      `the gallery frame's ${shared.id} story is ${shared.offBy}px off its card`
    );
  }
  // A story that cannot share the frame (its own mock handlers, a modal)
  // gets a frame of its own once its card nears the viewport; no other
  // card does.
  try {
    await page.waitForSelector('[data-testid="wb-thumb"][data-isolated]', {
      state: 'attached',
      timeout: 30000,
    });
    await page.$eval('[data-testid="wb-thumb"][data-isolated]', (el: Element) =>
      el.scrollIntoView({ block: 'center' })
    );
    await page.waitForSelector(
      '[data-testid="wb-thumb"][data-isolated][data-state="rendered"] iframe',
      { state: 'attached', timeout: 30000 }
    );
  } catch {
    failures.push(
      'no gallery card fell back to a frame of its own and rendered in it'
    );
  }
  const own = await page.evaluate(() => {
    const cards = Array.from(
      document.querySelectorAll('[data-testid="wb-thumb"]')
    );
    const framed = cards.filter((c) => c.querySelector('iframe'));
    return {
      isolated: cards.filter((c) => c.hasAttribute('data-isolated')).length,
      framed: framed.length,
      stray: framed
        .filter((c) => !c.hasAttribute('data-isolated'))
        .map((c) => c.getAttribute('data-story')),
    };
  });
  if (own.stray.length) {
    failures.push(
      `gallery cards with a frame of their own that share the gallery's: ${own.stray.join(
        ', '
      )}`
    );
  }
  console.log(
    `gallery: ${thumbs} component thumbnails, ${
      shared.painted
    } painted in the gallery frame (${shared.id} off by ${shared.offBy?.toFixed(
      2
    )}px), ${own.isolated} isolated, ${own.framed} in their own frame`
  );
};

// What the story's DOM shows of a global: the city's --gv-tenant-* tokens
// (the theme context), and for
// Arabic the right-to-left global style on the body.
type Shows = { key: string; value: string; before?: string };

const tenantTokens = (frame: any): Promise<string> =>
  frame.evaluate(() => {
    const style = document.documentElement.style;
    return Array.from(style)
      .filter((n) => n.startsWith('--gv-tenant-'))
      .map((n) => `${n}:${style.getPropertyValue(n)}`)
      .join(';');
  });

// Does `act` and checks that the canvas frame switched in place to what
// `attrs` (on the iframe) and `want` (the preview's current render, and the
// story's DOM) say: the same iframe element, the same document (a marker
// set in the frame stays; the preview reloading itself would drop it), no
// held copy of the old story left.
const switchInPlace = async (
  page: any,
  frame: any,
  label: string,
  act: () => Promise<unknown>,
  attrs: string,
  want: { storyId: string; shows?: Shows },
  failures: string[]
): Promise<boolean> => {
  try {
    await page.evaluate(() => {
      (window as any).__wbCanvas = document.querySelector(
        'iframe[data-testid="wb-canvas"]'
      );
    });
    await frame.evaluate(() => {
      (window as any).__wbSameDocument = true;
    });
    await act();
    await page.waitForSelector(`iframe[data-testid="wb-canvas"]${attrs}`, {
      timeout: 10000,
    });
    await frame.waitForFunction(
      (w: { storyId: string; shows?: Shows }) => {
        const render = (window as any).__STORYBOOK_PREVIEW__?.currentRender;
        if (render?.id !== w.storyId || render.phase !== 'finished') {
          return false;
        }
        const html = document.documentElement;
        const shows = w.shows;
        if (!shows) return true;
        if (shows.key === 'city') {
          const style = html.style;
          const now = Array.from(style)
            .filter((n) => n.startsWith('--gv-tenant-'))
            .map((n) => `${n}:${style.getPropertyValue(n)}`)
            .join(';');
          return !!now && now !== shows.before;
        }
        return getComputedStyle(document.body).textAlign === 'right';
      },
      want,
      { timeout: 10000 }
    );
  } catch {
    failures.push(`${label}: the frame never showed it`);
    return false;
  }
  const state = await frame.evaluate(() => ({
    same: (window as any).__wbSameDocument === true,
    held: document.querySelectorAll('[data-wb-held]').length,
  }));
  const element = await page.evaluate(
    () =>
      (window as any).__wbCanvas ===
      document.querySelector('iframe[data-testid="wb-canvas"]')
  );
  if (!element) failures.push(`${label}: the canvas frame was remounted`);
  if (!state.same) failures.push(`${label}: the frame loaded again`);
  if (state.held) failures.push(`${label}: the old story is still held`);
  return element && state.same && !state.held;
};

// A State goes on top of the variant (Primary and Disabled): the story
// stays, the frame's button turns disabled, Default takes it off.
const stateOnVariant = async (
  page: any,
  frame: any,
  variant: string,
  failures: string[]
) => {
  const chip = '[data-testid="wb-insp-state"] [data-value$="--disabled"]';
  if (!(await page.isVisible(chip))) return;
  const disabled = (on: boolean) =>
    frame.waitForFunction(
      (want: string) =>
        document
          .querySelector('#storybook-root button')
          ?.getAttribute('aria-disabled') === want,
      String(on),
      { timeout: 10000 }
    );
  await page.click(chip);
  try {
    await disabled(true);
    const story = await frame.evaluate(
      () => (window as any).__STORYBOOK_PREVIEW__?.currentRender?.id
    );
    if (story !== variant) {
      failures.push(`state on ${variant}: the frame switched to ${story}`);
      return;
    }
    await page.click('[data-testid="wb-insp-state"] [data-value$="--default"]');
    await disabled(false);
    console.log(`state: Disabled on ${variant}, then Default`);
  } catch {
    failures.push(`state on ${variant}: Disabled did not reach the frame`);
  }
};

// Clicks on one control made during a globals switch.
const EDIT_BURST = 31;

// The State and Variant chips, then a boolean control: the frame's story
// renders again with the new arg.
const controlsChecks = async (
  page: any,
  base: string,
  storyId: string,
  failures: string[]
) => {
  await page.goto(`${base}/workbench/#/components/${storyId}`);
  await page.waitForSelector('[data-testid="wb-insp-state"]', {
    timeout: 10000,
  });
  const tabs: number = await page.$$eval(
    '[data-testid="wb-insp-state"] button[data-value], [data-testid="wb-insp-variant"] button[data-value]',
    (els: Element[]) => els.length
  );
  if (tabs < MIN_STATE_TABS) {
    failures.push(
      `the Button page offers ${tabs} stories, expected ${MIN_STATE_TABS} or more`
    );
  }
  const frame = await canvasFrame(page);
  // The Props section of the Design tab starts folded.
  const props = '[data-testid="wb-insp-props"]';
  await page.waitForSelector(props, { timeout: 10000 });
  if (
    !(await page.$eval(props, (el: Element) => (el as HTMLDetailsElement).open))
  ) {
    await page.click(`${props} > summary`);
  }
  await page.waitForSelector('[data-testid="wb-controls-reset"]', {
    timeout: 20000,
  });

  // Another Variant switches the story in the same frame: the element stays,
  // the preview renders the chosen story, the session's edits stay on.
  const other: string | undefined = await page.$$eval(
    '[data-testid="wb-insp-variant"] button[data-value]',
    (els: Element[], id: string) =>
      els.map((e) => e.getAttribute('data-value')).find((v) => v !== id),
    storyId
  );
  if (other) {
    const radius = await radiusOf(frame);
    const ok = await switchInPlace(
      page,
      frame,
      `variant switch to ${other}`,
      () =>
        page.click(`[data-testid="wb-insp-variant"] [data-value="${other}"]`),
      `[data-story="${other}"]`,
      { storyId: other },
      failures
    );
    const after = await radiusOf(frame);
    if (after !== radius) {
      failures.push(
        `variant switch to ${other}: ${RADIUS_TOKEN} ${radius} became ${after}`
      );
    }
    if (ok && after === radius) {
      console.log(`canvas: switched to ${other} in the same frame`);
    }
    await stateOnVariant(page, frame, other, failures);
    // A city switches the same frame too (the page has no language picker:
    // a story sets its own).
    const globals: string[] = [];
    for (const key of ['city']) {
      const field = await settingOf(page, key);
      const next = field.values.find((v) => v !== field.value);
      if (field.disabled || !next) {
        failures.push(`${key}: the toolbar field is disabled or has no option`);
        continue;
      }
      const before = key === 'city' ? await tenantTokens(frame) : undefined;
      const done = await switchInPlace(
        page,
        frame,
        `${key} switch to ${next}`,
        () => pickSetting(page, key, next),
        `[data-${key}="${next}"]`,
        { storyId: other, shows: { key, value: next, before } },
        failures
      );
      if (done) globals.push(`${key} ${next}`);
    }
    if (globals.length) {
      console.log(`canvas: ${globals.join(', ')} in the same frame`);
    }
    await page.waitForSelector('[data-testid="wb-controls-reset"]', {
      timeout: 20000,
    });
  }
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
    console.log(`controls: ${tabs} stories; disabled changes the frame`);
  } catch {
    failures.push('switching the disabled control left the frame unchanged');
  }

  // Edits made while the city switches wait for the switch: a burst of
  // EDIT_BURST clicks on the control (odd, so the value ends changed), and
  // the frame does not load again and ends with the last edit and the new
  // city.
  const cities = await settingOf(page, 'city');
  const city = cities.values.find((v) => v !== cities.value) ?? cities.value;
  await frame.evaluate(() => {
    (window as any).__wbSameDocument = true;
  });
  const was: boolean = await page.isChecked(toggle);
  await pickSetting(page, 'city', city);
  for (let i = 0; i < EDIT_BURST; i++) await page.click(toggle);
  const disabled: boolean = await page.isChecked(toggle);
  if (disabled === was) {
    failures.push(`${EDIT_BURST} clicks left the disabled control as it was`);
  }
  try {
    await page.waitForSelector(
      `iframe[data-testid="wb-canvas"][data-city="${city}"]`,
      { timeout: 10000 }
    );
    await frame.waitForFunction(
      (w: { disabled: boolean }) => {
        const preview = (window as any).__STORYBOOK_PREVIEW__;
        const render = preview?.currentRender;
        const args = preview?.storyStoreValue?.args.get(render?.id);
        return (
          render?.phase === 'finished' &&
          !!args &&
          !!args.disabled === w.disabled
        );
      },
      { disabled },
      { timeout: 10000 }
    );
    // A reload loop would show after the first settle.
    await page.waitForTimeout(1500);
    const same = await frame.evaluate(
      () => (window as any).__wbSameDocument === true
    );
    if (same) {
      console.log(
        `controls: ${EDIT_BURST} edits during a switch to ${city} wait for it, the last one stays`
      );
    } else {
      failures.push(
        `an edit during a switch to ${city}: the frame loaded again`
      );
    }
  } catch {
    failures.push(
      `an edit during a switch to ${city}: the frame never showed both`
    );
  }

  // The same burst on a settled frame: the control does not fall back to
  // what the store had while later edits wait their turn.
  const start: boolean = await page.isChecked(toggle);
  let fellBack = 0;
  for (let i = 0; i < EDIT_BURST; i++) {
    if ((await page.isChecked(toggle)) !== (i % 2 === 0 ? start : !start)) {
      fellBack++;
    }
    await page.click(toggle);
  }
  try {
    await frame.waitForFunction(
      (w: boolean) => {
        const preview = (window as any).__STORYBOOK_PREVIEW__;
        const render = preview?.currentRender;
        const args = preview?.storyStoreValue?.args.get(render?.id);
        return render?.phase === 'finished' && !!args && !!args.disabled === w;
      },
      !start,
      { timeout: 10000 }
    );
    if (fellBack || (await page.isChecked(toggle)) === start) {
      failures.push(
        `${EDIT_BURST} quick clicks: the control fell back ${fellBack} times`
      );
    } else {
      console.log(`controls: ${EDIT_BURST} quick clicks end on the last one`);
    }
  } catch {
    failures.push(`${EDIT_BURST} quick clicks: the frame missed the last one`);
  }
};

// The Button page's Design tab (pill, attach, snap, Changes, Copy for
// agent, Reset all), the Usage tab and the A11y tab.
const panelChecks = async (
  page: any,
  base: string,
  storyId: string,
  failures: string[]
) => {
  await page
    .context()
    .grantPermissions(['clipboard-read', 'clipboard-write'])
    .catch(() => undefined);
  // A fresh session: the canvas checks left the radius token at 20px, and
  // the platform's button still renders 3px.
  await page.evaluate(() => window.localStorage.removeItem('gv-overrides'));
  await page.goto(`${base}/workbench/#/components/${storyId}`);
  await page.reload();
  await page.click('[data-testid="wb-panel-tab"][data-tab="design"]');
  const radius = `[data-testid="wb-panel-design"] [data-testid="wb-insp-value"][data-token="${RADIUS_TOKEN}"]`;
  let link: string | null = null;
  try {
    await page.waitForFunction(
      (sel: string) =>
        ['equal', 'linked'].includes(
          document.querySelector(sel)?.getAttribute('data-link') ?? ''
        ),
      radius,
      { timeout: 20000 }
    );
  } catch {
    // Reported below with the last value.
  }
  link = await page
    .$eval(radius, (el: Element) => el.getAttribute('data-link'))
    .catch(() => null);
  // The button's radius is a raw 3px on the platform: the Design tab
  // offers the token it equals.
  if (link !== 'equal' && link !== 'linked') {
    failures.push(
      `the Design tab shows the button's radius as ${
        link ?? 'missing'
      }, expected it to equal ${RADIUS_TOKEN}`
    );
  }
  // A click on the canvas picks the element under it: the button's label.
  const layer = '[data-testid="wb-insp-selection"] .wb-insp-layer-name';
  const frame = await canvasFrame(page);
  const label = await frame.$('#storybook-root button span');
  let picked = '';
  if (label) {
    const box = await label.boundingBox();
    if (box) {
      await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
      await page
        .waitForFunction(
          (sel: string) =>
            document.querySelector(sel)?.textContent?.startsWith('span'),
          layer,
          { timeout: 5000 }
        )
        .catch(() => undefined);
    }
    picked = await page.textContent(layer).catch(() => '');
    if (!picked?.startsWith('span')) {
      failures.push(`a click on the button label selected "${picked}"`);
    }
  }

  // Back to the button (Esc selects the parent): Size is hard-coded and
  // equals SIZE_TOKEN, so its field offers to attach it.
  await page.keyboard.press('Escape');
  const value = (row: string) =>
    `[data-testid="wb-panel-design"] [data-row="${row}"][data-testid="wb-insp-value"]`;
  const suggest = `[data-testid="wb-panel-design"] [data-row="size"] [data-testid="wb-insp-suggest"][data-token="${SIZE_TOKEN}"]`;
  const linkedTo = async (row: string) => {
    try {
      await page.waitForFunction(
        (sel: string) =>
          document.querySelector(sel)?.getAttribute('data-link') === 'linked',
        value(row),
        { timeout: 10000 }
      );
    } catch {
      // Reported by the caller.
    }
    return page
      .$eval(value(row), (el: Element) => el.getAttribute('data-token'))
      .catch(() => null);
  };
  let attached: string | null = null;
  try {
    await page.waitForSelector(suggest, { timeout: 20000 });
    await page.click(suggest);
    attached = await linkedTo('size');
  } catch {
    // Reported below.
  }
  if (attached !== SIZE_TOKEN) {
    failures.push(
      `attaching ${SIZE_TOKEN} to Size left the field ${attached ?? 'unbound'}`
    );
  }
  const badge = async () =>
    page
      .$eval(
        '[data-testid="wb-changes-toggle"] .wb-count',
        (el: Element) => el.textContent ?? ''
      )
      .catch(() => '');
  // The token edit the canvas checks left counts too.
  const tokenEdits = await page.evaluate(() => {
    try {
      return Object.keys(
        JSON.parse(window.localStorage.getItem('gv-overrides') ?? '{}')
      ).length;
    } catch {
      return 0;
    }
  });
  const afterAttach = await badge();
  if (Number(afterAttach) !== tokenEdits + 1) {
    failures.push(
      `after the attach the Changes badge reads ${afterAttach}, expected ${
        tokenEdits + 1
      }`
    );
  }
  // Typing 12 into the vertical padding snaps to the space scale.
  const pad = `[data-testid="wb-panel-design"] [data-row="padding-v"] [data-testid="wb-insp-input"]`;
  let snapped: string | null = null;
  if (await page.$(pad)) {
    await page.fill(pad, '12');
    await page.press(pad, 'Enter');
    snapped = await linkedTo('padding-v');
    if (snapped !== SNAP_TOKEN) {
      failures.push(
        `typing 12 into the vertical padding gave ${
          snapped ?? 'no token'
        }, expected ${SNAP_TOKEN}`
      );
    }
  } else {
    failures.push('the Design tab shows no vertical padding field');
  }
  // One Changes list with both edits and a task for the agent.
  await page.click('[data-testid="wb-changes-toggle"]');
  const rows: number = await page.$$eval(
    '[data-testid="wb-changes"] [data-testid="wb-change-row"][data-kind]',
    (els: Element[]) => els.length
  );
  if (rows < 2) {
    failures.push(`the Changes drawer lists ${rows} element edits, expected 2`);
  }
  await page.click('[data-testid="wb-copy-agent"]');
  const task: string = await page
    .waitForSelector('[data-testid="wb-copy-fallback"]', { timeout: 1500 })
    .then(() =>
      page.$eval(
        '[data-testid="wb-copy-fallback"]',
        (el: Element) => (el as HTMLTextAreaElement).value
      )
    )
    .catch(() =>
      page.evaluate(() => navigator.clipboard.readText()).catch(() => '')
    );
  if (!task.includes(`→ ${SIZE_TOKEN}`)) {
    failures.push(
      `the agent task does not name ${SIZE_TOKEN}: ${
        task.slice(0, 160) || 'nothing copied'
      }`
    );
  }
  await page.click('[data-testid="wb-changes"] button:has-text("Reset all")');
  const left: number = await page.$$eval(
    '[data-testid="wb-change-row"]',
    (els: Element[]) => els.length
  );
  const cleared = await badge();
  if (left !== 0 || cleared !== '0') {
    failures.push(`Reset all left ${left} changes, the badge reads ${cleared}`);
  }
  const back = await page
    .waitForFunction(
      (sel: string) =>
        document.querySelector(sel)?.getAttribute('data-link') !== 'linked',
      value('size'),
      { timeout: 10000 }
    )
    .then(() => true)
    .catch(() => false);
  if (!back) failures.push('after Reset all Size is still a pill');
  await page.click('[data-testid="wb-changes"] button:has-text("Close")');
  console.log(
    `design: ${RADIUS_TOKEN} ${link} on the button; a click selects ${picked}; ` +
      `attach ${attached}, badge ${afterAttach}; 12 snaps to ${snapped}; ` +
      `task ${task.split('\n')[0]}; reset all ${cleared}`
  );

  // The Usage tab: back office routes.
  await page.click('[data-testid="wb-panel-tab"][data-tab="usage"]');
  const admin = '[data-testid="wb-usage-route"][data-office="admin"]';
  let routes = 0;
  try {
    await page.waitForSelector(admin, { timeout: 20000 });
    routes = await page.$$eval(admin, (els: Element[]) => els.length);
  } catch {
    failures.push('the Usage tab lists no back office route for Button');
  }
  console.log(`usage: ${routes} back office routes`);

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

// The design changes the Review page shows: heal, lift and token commits
// that still change platform code (prReview.designChanges in the shell).
export const designChangeCount = (changes: any): number =>
  (Array.isArray(changes?.commits) ? changes.commits : []).filter(
    (c: any) =>
      ['heal', 'lift', 'token'].includes(c?.kind) &&
      (c.files ?? []).some(
        (f: string) =>
          f.startsWith('front/app/') &&
          !/\.(stories|test)\.tsx?$/.test(f) &&
          !/\/a11y\.json$/.test(f) &&
          !f.includes('/__mocks__/') &&
          !f.startsWith('front/app/design-system/tokens/') &&
          !f.startsWith('front/app/utils/storybook/')
      )
  ).length;

// The Review page: the PR line (no PR on a local server), the count of
// design changes equal to design-changes.json's, one card per change, and
// the empty state when there is none.
const reviewChecks = async (
  page: any,
  base: string,
  root: string,
  failures: string[]
) => {
  let expected = 0;
  try {
    expected = designChangeCount(
      JSON.parse(
        fs.readFileSync(path.join(root, 'design-changes.json'), 'utf8')
      )
    );
  } catch {
    // No change list in the build: the page shows none.
  }
  await page.goto(`${base}/workbench/#/review`);
  await page.waitForSelector('[data-testid="wb-review-pr"]', {
    timeout: 15000,
  });
  try {
    await page.waitForFunction(
      () =>
        /^\d+$/.test(
          document.querySelector('[data-testid="wb-review-count"]')
            ?.textContent ?? ''
        ),
      null,
      { timeout: 15000 }
    );
  } catch {
    failures.push('review: the change count never showed');
    return;
  }
  const count = Number(
    await page.textContent('[data-testid="wb-review-count"]')
  );
  const cards: number = await page.$$eval(
    '[data-testid="wb-pr-card"]',
    (els: Element[]) => els.length
  );
  if (count !== expected || cards !== expected) {
    failures.push(
      `review: ${count} changes and ${cards} cards, expected ${expected} from design-changes.json`
    );
  }
  if (expected === 0 && !(await page.$('[data-testid="wb-review-empty"]'))) {
    failures.push('review: no design changes, but no empty state');
  }
  console.log(`review: ${count} design changes, ${cards} cards`);
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
  const server = await serve(root, Number(arg('port') ?? 0) || 0);
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

    await page.goto(`${base}/workbench/`, { waitUntil: 'networkidle' });
    await page.waitForSelector('main h1:has-text("Components")', {
      timeout: 10000,
    });

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
    const current: string =
      (await page.textContent(
        '[data-testid="wb-nav"] a[aria-current="page"]'
      )) ?? '';
    if (current.trim() !== 'Components') {
      failures.push(`the default route marks "${current.trim()}" in the nav`);
    }
    console.log(`nav: ${nav.length} entries; default ${hashOf(page.url())}`);

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

    await redirectChecks(page, base, failures);

    await foundationsChecks(page, base, failures, {
      colour: colourScreenshot,
      spacing: spacingScreenshot,
    });

    await galleryChecks(page, base, failures);

    await reviewChecks(page, base, root, failures);

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
