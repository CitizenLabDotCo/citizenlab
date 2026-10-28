// Checks the Design tab's traces against values written down from the code.
//
//   npm run ds:trace-check -- --url <storybook base> [--only <story id>]
//                             [--json <file>]
//
// <storybook base> is where a built Storybook is served, with the workbench
// at <base>/workbench/ (a local static build, or the epic's /storybook/).
// For each row of ROWS it opens the workbench on the story, selects the
// element (the story's first selection, or a click on a point where the
// element itself is hit), and compares the row's computed value and its
// source line with the expected ones. The expected values were written
// from the code before any run (notes on the trace plan, section 5).
// Prints a table; exits 1 on any failure, 2 when Playwright is missing.
//
// runTraceCheck(page, base) takes any Playwright page, so a launcher with
// its own browser profile (one signed in to the epic) can call it.
import fs from 'fs';

import { loadPlaywright } from './playwright';

export type Select =
  | { default: true; layer: string }
  // A CSS selector inside the story box; `layer` is how the selection's
  // layer name starts (its role or tag).
  | { click: string; layer: string };

export type Expected = {
  // The PropTrace status the row's source line carries.
  status: 'traced' | 'inherited' | 'inline' | 'default' | 'untraced';
  // The leaf's read kind (literal, theme, const, prop, …), when traced.
  read?: string;
  // The file (path suffix) and line the source line names.
  file?: string;
  line?: number;
  // Text the source line holds: the expression, or the reason.
  text?: string;
  // True when the declaration is the story's own frame.
  storyFrame?: boolean;
};

export type Row = {
  story: string;
  element: string;
  select: Select;
  row: string;
  value: string;
  expect: Expected;
};

export const ROWS: Row[] = [
  // The plan's table (section 5).
  {
    story: 'components-actions-button--default',
    element: 'the button',
    select: { default: true, layer: 'button' },
    row: 'radius',
    value: '3px',
    expect: {
      status: 'traced',
      read: 'theme',
      file: 'component-library/components/Button/index.tsx',
      line: 344,
      text: 'props.theme.borderRadius',
    },
  },
  {
    story: 'components-actions-button--default',
    element: 'the button',
    select: { default: true, layer: 'button' },
    row: 'padding-v',
    value: '9px',
    expect: {
      status: 'traced',
      read: 'literal',
      file: 'component-library/components/Button/index.tsx',
      line: 121,
      text: "'9px 18px'",
    },
  },
  {
    story: 'components-actions-button--default',
    element: 'the label (ButtonText span)',
    select: { click: 'button span', layer: 'span' },
    row: 'size',
    value: '16px',
    expect: {
      status: 'traced',
      file: 'component-library/components/Button/index.tsx',
      line: 101,
      text: 'fontSizes.base',
    },
  },
  {
    story: 'components-actions-button--back-office-primary',
    element: 'the button',
    select: { default: true, layer: 'button' },
    row: 'radius',
    value: '8px',
    expect: {
      status: 'traced',
      read: 'const',
      file: 'component-library/components/Button/index.tsx',
      line: 75,
      text: 'bo.borderRadius',
    },
  },
  // Eight more, written from the code the same way.
  {
    story: 'components-layout-box--default',
    element: 'the Box',
    select: { default: true, layer: 'div' },
    row: 'fill',
    value: 'rgb(255, 255, 255)',
    expect: {
      status: 'traced',
      read: 'prop',
      file: 'component-library/components/Box/index.tsx',
      line: 337,
      text: 'bgColor',
    },
  },
  {
    story: 'components-typography-text--body-m',
    element: 'the paragraph',
    select: { default: true, layer: 'p' },
    row: 'size',
    value: '16px',
    expect: {
      status: 'traced',
      read: 'const',
      file: 'component-library/components/Text/index.tsx',
      line: 180,
      text: 'fontSizes.m',
    },
  },
  {
    story: 'components-forms-input--default',
    element: 'the input',
    select: { default: true, layer: 'input' },
    row: 'padding',
    value: '10px',
    expect: {
      status: 'traced',
      read: 'literal',
      file: 'component-library/utils/styleUtils.ts',
      line: 312,
      text: '10px',
    },
  },
  {
    story: 'components-forms-toggle--default',
    element: 'the track',
    select: { click: 'i', layer: 'i' },
    row: 'fill',
    value: 'rgb(203, 203, 203)',
    expect: {
      status: 'traced',
      read: 'const',
      file: 'component-library/components/Toggle/index.tsx',
      line: 47,
      text: 'colors.grey400',
    },
  },
  {
    story: 'components-forms-checkbox--default',
    element: 'the box',
    select: { click: 'input[type="checkbox"] + div', layer: 'div' },
    row: 'radius',
    value: '3px',
    expect: {
      status: 'traced',
      read: 'theme',
      file: 'component-library/components/Checkbox/index.tsx',
      line: 80,
      text: 'props.theme.borderRadius',
    },
  },
  {
    story: 'components-forms-checkbox--default',
    element: 'the box',
    select: { click: 'input[type="checkbox"] + div', layer: 'div' },
    row: 'stroke-color',
    value: 'rgb(118, 118, 118)',
    // getColor is imported from ./utils: only same-file calls are followed,
    // so the trace stops at the call that writes it, and the edit is refused.
    expect: {
      status: 'traced',
      read: 'call',
      file: 'component-library/components/Checkbox/index.tsx',
      line: 42,
      text: 'computed by getColor',
    },
  },
  {
    story: 'components-feedback-spinner--default',
    element: 'the spinner',
    select: { default: true, layer: 'span' },
    row: 'radius',
    value: '50%',
    // Its rules align with no template of the index: said, not guessed.
    expect: { status: 'untraced', text: 'not traced' },
  },
  {
    story: 'components-data-display-badge--default',
    element: 'the badge',
    select: { default: true, layer: 'div' },
    row: 'color',
    value: 'rgb(189, 189, 189)',
    expect: {
      status: 'traced',
      read: 'const',
      file: 'component-library/components/Badge/index.tsx',
      line: 7,
      text: 'colors.disabled',
    },
  },
  {
    story: 'components-redesigned-events-setup-card--default',
    element: 'the card',
    select: { click: 'section', layer: 'section' },
    row: 'radius',
    value: '8px',
    expect: {
      status: 'traced',
      read: 'prop',
      file: 'component-library/components/Box/index.tsx',
      line: 470,
      text: 'borderRadius',
    },
  },
  {
    story: 'components-redesigned-events-setup-card--default',
    element: 'the story frame',
    select: { default: true, layer: 'div' },
    row: 'padding',
    value: '18px',
    expect: {
      status: 'inline',
      file: 'Event/SetupCard.stories.tsx',
      line: 32,
      storyFrame: true,
    },
  },
];

export type Result = {
  row: Row;
  ok: boolean;
  got: {
    layer?: string;
    value?: string;
    status?: string;
    read?: string;
    file?: string;
    line?: number;
    text?: string;
    storyFrame?: boolean;
  };
  failures: string[];
};

export const PANEL = '[data-testid="wb-panel-design"]';
export const LAYER = '[data-testid="wb-insp-selection"] .wb-insp-layer-name';

export const canvas = async (page: any) => {
  const handle = await page.waitForSelector('iframe[data-testid="wb-canvas"]', {
    timeout: 20000,
  });
  const frame = await handle.contentFrame();
  await frame.waitForSelector('[data-gv-story-box] > *', { timeout: 30000 });
  return { handle, frame };
};

// A point, in the page's coordinates, where the element under `selector`
// is itself the one hit (not a child drawn over it), or null.
export const hitPoint = async (frame: any, handle: any, selector: string) => {
  const found = await frame.evaluate((sel: string) => {
    const box = document.querySelector('[data-gv-story-box]');
    const el = box?.querySelector(sel);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    const xs = [0.5, r.width / 2, r.width - 0.5];
    const ys = [0.5, r.height / 2, r.height - 0.5];
    for (let i = 1; i < 8; i++) {
      xs.push((r.width * i) / 8);
      ys.push((r.height * i) / 8);
    }
    for (const dy of ys) {
      for (const dx of xs) {
        const x = r.left + dx;
        const y = r.top + dy;
        // The canvas lays a transparent cover over the story and picks the
        // first story element under the pointer, as here.
        const top = document
          .elementsFromPoint(x, y)
          .find((at) => box?.contains(at) && at !== box);
        if (top === el) return { x, y };
      }
    }
    return null;
  }, selector);
  if (!found) return null;
  // The frame may be scaled: map its CSS pixels onto the page's.
  const frameBox = await handle.boundingBox();
  const size = await frame.evaluate(() => ({
    w: document.documentElement.clientWidth,
    h: document.documentElement.clientHeight,
  }));
  if (!frameBox || !size.w || !size.h) return null;
  return {
    x: frameBox.x + (found.x * frameBox.width) / size.w,
    y: frameBox.y + (found.y * frameBox.height) / size.h,
  };
};

export const waitLayer = async (page: any, layer: string) => {
  try {
    await page.waitForFunction(
      ([sel, start]: string[]) =>
        (document.querySelector(sel)?.textContent ?? '').startsWith(start),
      [LAYER, layer],
      { timeout: 10000 }
    );
  } catch {
    // Reported by the caller.
  }
  return ((await page.textContent(LAYER).catch(() => '')) ?? '').trim();
};

export const readRow = async (page: any, row: string) => {
  const source = `${PANEL} [data-testid="wb-insp-source"][data-row="${row}"]`;
  try {
    // The source lines fill in after the rows: wait for this one's.
    await page.waitForFunction(
      (sel: string) => {
        const el = document.querySelector(sel);
        return !!el && el.getAttribute('data-status') !== 'pending';
      },
      source,
      { timeout: 20000 }
    );
  } catch {
    // Reported below with what is there.
  }
  const value = await page
    .$eval(
      `${PANEL} [data-testid="wb-insp-value"][data-row="${row}"]`,
      (el: Element) => el.getAttribute('data-raw')
    )
    .catch(() => null);
  const src = await page
    .$eval(source, (el: Element) => ({
      status: el.getAttribute('data-status'),
      read: el.getAttribute('data-read'),
      file: el.getAttribute('data-file'),
      line: el.getAttribute('data-line'),
      storyFrame: el.getAttribute('data-story-frame') === 'true',
      text: (el.textContent ?? '').replace(/\s+/g, ' ').trim(),
    }))
    .catch(() => null);
  return { value, src };
};

const compare = (r: Row, got: Result['got']): string[] => {
  const e = r.expect;
  const out: string[] = [];
  if (!got.layer?.startsWith(r.select.layer)) {
    out.push(`selected "${got.layer ?? ''}", expected a ${r.select.layer}`);
  }
  if (got.value !== r.value) {
    out.push(`value ${got.value ?? 'missing'}, expected ${r.value}`);
  }
  if (got.status !== e.status) {
    out.push(`status ${got.status ?? 'missing'}, expected ${e.status}`);
  }
  if (e.read && got.read !== e.read) {
    out.push(`read ${got.read ?? 'missing'}, expected ${e.read}`);
  }
  if (e.file && !got.file?.endsWith(e.file)) {
    out.push(`file ${got.file ?? 'missing'}, expected …${e.file}`);
  }
  if (e.line !== undefined && got.line !== e.line) {
    out.push(`line ${got.line ?? 'missing'}, expected ${e.line}`);
  }
  if (e.text && !got.text?.includes(e.text)) {
    out.push(`source "${got.text ?? ''}" lacks "${e.text}"`);
  }
  if (e.storyFrame !== undefined && got.storyFrame !== e.storyFrame) {
    out.push(`story frame ${got.storyFrame}, expected ${e.storyFrame}`);
  }
  return out;
};

export const checkRow = async (
  page: any,
  base: string,
  r: Row
): Promise<Result> => {
  const got: Result['got'] = {};
  const fail = (why: string): Result => ({
    row: r,
    ok: false,
    got,
    failures: [why],
  });
  await page.goto(
    `${base.replace(/\/$/, '')}/workbench/#/components/${r.story}`
  );
  await page.reload();
  await page.click('[data-testid="wb-panel-tab"][data-tab="design"]', {
    timeout: 20000,
  });
  let frame;
  let handle;
  try {
    ({ frame, handle } = await canvas(page));
  } catch {
    return fail('the story did not render in the canvas');
  }
  if ('click' in r.select) {
    const at = await hitPoint(frame, handle, r.select.click);
    if (!at) return fail(`no point hits ${r.select.click} itself`);
    await page.mouse.click(at.x, at.y);
  }
  got.layer = await waitLayer(page, r.select.layer);
  const { value, src } = await readRow(page, r.row);
  got.value = value ?? undefined;
  if (src) {
    got.status = src.status ?? undefined;
    got.read = src.read ?? undefined;
    got.file = src.file ?? undefined;
    got.line = src.line ? Number(src.line) : undefined;
    got.text = src.text;
    got.storyFrame = src.storyFrame;
  }
  const failures = compare(r, got);
  return { row: r, ok: failures.length === 0, got, failures };
};

export const runTraceCheck = async (
  page: any,
  base: string,
  rows: Row[] = ROWS
): Promise<Result[]> => {
  const out: Result[] = [];
  for (const r of rows) {
    try {
      out.push(await checkRow(page, base, r));
    } catch (e) {
      out.push({
        row: r,
        ok: false,
        got: {},
        failures: [`error: ${(e as Error).message.split('\n')[0]}`],
      });
    }
  }
  return out;
};

const cell = (s: string, n: number) =>
  s.length > n ? `${s.slice(0, n - 1)}…` : s.padEnd(n);

export const table = (results: Result[]): string =>
  results
    .map((x) => {
      const where = x.got.file
        ? `${x.got.file.split('/').slice(-2).join('/')}:${x.got.line ?? '?'}`
        : x.got.status ?? '';
      const head = `${x.ok ? 'ok  ' : 'FAIL'} ${cell(x.row.story, 52)} ${cell(
        x.row.row,
        12
      )} ${cell(x.got.value ?? '', 20)} ${where}`;
      return x.ok ? head : `${head}\n       ${x.failures.join('; ')}`;
    })
    .join('\n');

const arg = (name: string) => {
  const i = process.argv.indexOf(name);
  return i > -1 ? process.argv[i + 1] : undefined;
};

const main = async () => {
  const base = arg('--url');
  if (!base) {
    console.error('Usage: npm run ds:trace-check -- --url <storybook base>');
    process.exit(2);
  }
  const only = arg('--only');
  const rows = only ? ROWS.filter((r) => r.story === only) : ROWS;
  const { chromium } = loadPlaywright();
  // The bot machine's guest has no user namespaces for the sandbox.
  const browser = await chromium.launch({
    chromiumSandbox: process.env.GV_CHROMIUM_SANDBOX === '1',
  });
  let results: Result[] = [];
  try {
    const page = await browser.newPage({
      viewport: { width: 1440, height: 900 },
    });
    results = await runTraceCheck(page, base, rows);
  } finally {
    await browser.close();
  }
  console.log(table(results));
  const failed = results.filter((x) => !x.ok).length;
  console.log(`\n${results.length - failed} of ${results.length} rows pass`);
  const json = arg('--json');
  if (json) {
    fs.writeFileSync(
      json,
      `${JSON.stringify(
        results.map((x) => ({ ...x.row, got: x.got, failures: x.failures })),
        null,
        2
      )}\n`
    );
  }
  process.exit(failed ? 1 : 0);
};

if (require.main === module) main();
