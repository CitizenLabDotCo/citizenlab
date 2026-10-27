// The workbench demo as a test, on ten of the most used components.
//
//   npm run ds:demo-check -- --url <storybook base> [--send-dry-run]
//                            [--json <file>] [--shots <dir>]
//                            [--stories <file> --no-edit]
//
// For each component it opens the story in the workbench and checks the
// Design tab twice: on the first selection, then on a click on the story's
// first text. Every section shown must give each row a value and a source
// line: traced to a file:line, or "not traced" with the reason. Then it
// makes one change (a token the row offers, else a typed value) and checks
// the Changes count. After the ten it checks that the Review page lists a
// change for each story, opens Send, and times how long Send takes to read
// the code on GitHub and write its edits. With --send-dry-run it also runs
// send.js --dry-run on that text and times it: every read the send does,
// no write, no review opened. With --shots it saves a picture of the
// Design tab on each first selection, 1440 by 900, light. --stories takes
// another list ([{ component, story }] in a JSON file); --no-edit checks
// the selections only, with no change, Review or Send.
// Prints a table; exits 1 on any failure, 2 when Playwright is missing.
import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';

import { loadPlaywright } from './playwright';
import { canvas, hitPoint, LAYER, PANEL } from './trace-check';

// The ten, by how often the platform uses them (design-scan usageCount),
// each with its plainest story.
export const DEMO: { component: string; story: string }[] = [
  { component: 'Box', story: 'components-layout-box--default' },
  { component: 'Text', story: 'components-typography-text--body-m' },
  { component: 'Button', story: 'components-actions-button--default' },
  { component: 'Title', story: 'components-typography-title--h-1' },
  {
    component: 'ButtonWithLink',
    story: 'components-actions-buttonwithlink--default',
  },
  { component: 'Warning', story: 'components-feedback-warning--default' },
  { component: 'Label', story: 'components-forms-label--default' },
  { component: 'Input', story: 'components-forms-input--default' },
  { component: 'Select', story: 'components-forms-select--default' },
  { component: 'Toggle', story: 'components-forms-toggle--default' },
];

export type RowSeen = {
  row: string;
  value: string | null;
  status: string | null;
  text: string;
};

export type SectionSeen = { section: string; rows: RowSeen[] };

export type Selection = { layer: string; sections: SectionSeen[] };

export type DemoResult = {
  component: string;
  story: string;
  first?: Selection;
  text?: Selection;
  edit?: { row: string; how: 'token' | 'typed'; to: string };
  ms: number;
  failures: string[];
};

const SECTIONS = `${PANEL} [data-testid="wb-insp-section"]`;

// Every section of the selection with its rows, once no source line is
// pending.
const sectionsOf = async (page: any): Promise<SectionSeen[]> => {
  // The rows render for the new selection first, its source lines after.
  await page.waitForTimeout(300);
  try {
    await page.waitForFunction(
      (panel: string) =>
        !document.querySelector(
          `${panel} [data-testid="wb-insp-source"][data-status="pending"]`
        ),
      PANEL,
      { timeout: 20000 }
    );
  } catch {
    // The pending rows are reported.
  }
  return page.$$eval(SECTIONS, (els: Element[]) =>
    els
      .filter((s) => s.getAttribute('data-empty') !== 'true')
      .map((s) => ({
        section: s.getAttribute('data-section') ?? '',
        rows: [
          ...s.querySelectorAll('[data-testid="wb-insp-value"][data-row]'),
        ].map((v) => {
          const row = v.getAttribute('data-row') ?? '';
          const src = s.querySelector(
            `[data-testid="wb-insp-source"][data-row="${row}"]`
          );
          return {
            row,
            value: v.getAttribute('data-raw'),
            status: src?.getAttribute('data-status') ?? null,
            text: (src?.textContent ?? '').replace(/\s+/g, ' ').trim(),
          };
        }),
      }))
  );
};

// What is wrong with a selection: a row with no value, no source line, a
// line still pending, or "not traced" without its reason.
export const problemsOf = (where: string, sel: Selection): string[] => {
  const out: string[] = [];
  if (sel.sections.length === 0) out.push(`${where}: no Design sections`);
  for (const s of sel.sections) {
    for (const r of s.rows) {
      const at = `${where} ${s.section}/${r.row}`;
      if (!r.value) out.push(`${at}: no value`);
      // Selection colours sum up the layers inside: no one line writes them.
      if (s.section === 'selection-colours') continue;
      if (!r.status) out.push(`${at}: no source line`);
      else if (r.status === 'pending') out.push(`${at}: source still pending`);
      else if (r.status === 'untraced' && !/^not traced: \S/.test(r.text)) {
        out.push(`${at}: not traced without a reason`);
      }
    }
  }
  return out;
};

const layerOf = async (page: any) =>
  ((await page.textContent(LAYER).catch(() => '')) ?? '').trim();

// Selectors, inside the story box, for the elements holding text of their
// own, the deepest first. A string, so the runner's helpers (tsx names its
// functions) stay out of the page.
const TEXTS = `(() => {
  const box = document.querySelector('[data-gv-story-box]');
  if (!box) return [];
  const own = (el) =>
    [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
  const out = [];
  const walk = (el) => {
    for (const c of el.children) walk(c);
    // A form control draws its text itself (an input's value, a select's
    // option). Text for screen readers only (a 1px box) draws nothing.
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) return;
    if (el !== box && (own(el) || el.matches('input, select, textarea'))) {
      out.push(el);
    }
  };
  walk(box);
  return out.slice(0, 12).map((el) => {
    const steps = [];
    for (let at = el; at !== box; at = at.parentElement) {
      steps.unshift(':nth-child(' + ([...at.parentElement.children].indexOf(at) + 1) + ')');
    }
    return ':scope > ' + steps.join(' > ');
  });
})()`;

// The first text the pointer can reach, and where.
const firstText = async (frame: any, handle: any) => {
  const sels: string[] = await frame.evaluate(TEXTS);
  for (const sel of sels) {
    const at = await hitPoint(frame, handle, sel);
    if (at) return { sel, at };
  }
  return sels.length ? { sel: sels[0] } : undefined;
};

const changesCount = async (page: any): Promise<number> =>
  Number(
    await page
      .$eval(
        '[data-testid="wb-changes-toggle"] .wb-count',
        (el: Element) => el.textContent ?? '0'
      )
      .catch(() => '0')
  );

// One change on the selection: the first token a row offers, else a typed
// radius or padding.
const editOnce = async (page: any): Promise<DemoResult['edit'] | undefined> => {
  const offer = await page.$(
    `${SECTIONS}:not([data-section="selection-colours"]) [data-testid="wb-insp-suggest"]`
  );
  if (offer) {
    const [row, token] = await offer.evaluate((el: Element) => [
      el.closest('[data-row]')?.getAttribute('data-row') ?? '',
      el.getAttribute('data-token') ?? '',
    ]);
    await offer.click();
    return { row, how: 'token', to: token };
  }
  for (const row of ['radius', 'padding-v', 'padding-h', 'size', 'gap']) {
    const input = await page.$(
      `${PANEL} [data-row="${row}"] [data-testid="wb-insp-input"]`
    );
    if (!input) continue;
    const now = await input.inputValue().catch(() => '');
    const to = now === '12' ? '16' : '12';
    await input.fill(to);
    await input.press('Enter');
    return { row, how: 'typed', to };
  }
  return undefined;
};

export const checkComponent = async (
  page: any,
  base: string,
  c: { component: string; story: string },
  shots?: string,
  edit = true
): Promise<DemoResult> => {
  const started = Date.now();
  const out: DemoResult = { ...c, ms: 0, failures: [] };
  const done = () => ({ ...out, ms: Date.now() - started });
  await page.goto(
    `${base.replace(/\/$/, '')}/workbench/#/components/${c.story}`
  );
  await page.click('[data-testid="wb-panel-tab"][data-tab="design"]', {
    timeout: 20000,
  });
  let frame;
  let handle;
  try {
    ({ frame, handle } = await canvas(page));
  } catch {
    out.failures.push('the story did not render in the canvas');
    return done();
  }
  await page
    .waitForSelector(SECTIONS, { timeout: 10000 })
    .catch(() => undefined);
  out.first = { layer: await layerOf(page), sections: await sectionsOf(page) };
  if (shots) {
    fs.mkdirSync(shots, { recursive: true });
    await page.screenshot({ path: path.join(shots, `${c.component}.png`) });
  }
  out.failures.push(...problemsOf('first selection', out.first));

  const before = await changesCount(page);
  out.edit = edit ? await editOnce(page) : undefined;
  if (!edit) {
    // Selections only.
  } else if (!out.edit) {
    out.failures.push('no row of the first selection takes a change');
  } else {
    await page
      .waitForFunction(
        (n: number) =>
          Number(
            document.querySelector(
              '[data-testid="wb-changes-toggle"] .wb-count'
            )?.textContent ?? '0'
          ) > n,
        before,
        { timeout: 5000 }
      )
      .catch(() => undefined);
    const after = await changesCount(page);
    if (after <= before) {
      out.failures.push(
        `after the change the Changes count still reads ${after}`
      );
    }
  }

  // The text layer: Typography with the rest.
  const hit = await firstText(frame, handle);
  if (hit) {
    const { at } = hit;
    if (!at) {
      out.failures.push(`no point hits a text of the story (${hit.sel})`);
    } else {
      const was = await layerOf(page);
      await page.mouse.click(at.x, at.y);
      await page
        .waitForFunction(
          ([s, w]: string[]) =>
            (document.querySelector(s)?.textContent ?? '').trim() !== w,
          [LAYER, was],
          { timeout: 5000 }
        )
        .catch(() => undefined);
      out.text = {
        layer: await layerOf(page),
        sections: await sectionsOf(page),
      };
      out.failures.push(...problemsOf('text', out.text));
      if (!out.text.sections.some((s) => s.section === 'typography')) {
        out.failures.push('text: no Typography section');
      }
    }
  }
  // A story with no text (a toggle alone) has no Typography to check.
  return done();
};

export type SendResult = {
  // From the click on a reviewer to the text being ready.
  ms: number;
  edits: number;
  byHand: number;
  input?: unknown;
  dryRun?: { ms: number; code: number | null; out: string };
  failures: string[];
};

// The text between the heredoc lines of the copied command.
export const inputOfText = (text: string): unknown => {
  const lines = text.split('\n');
  const from = lines.findIndex((l) => l.endsWith("<<'EOF'"));
  const to = lines.indexOf('EOF', from + 1);
  if (from < 0 || to < 0) return undefined;
  try {
    return JSON.parse(lines.slice(from + 1, to).join('\n'));
  } catch {
    return undefined;
  }
};

export const checkReviewAndSend = async (
  page: any,
  base: string,
  stories: string[],
  dryRun: boolean
): Promise<{ missing: string[]; send: SendResult }> => {
  await page.goto(`${base.replace(/\/$/, '')}/workbench/#/review`);
  await page
    .waitForSelector('[data-testid="wb-review-draft"]', { timeout: 20000 })
    .catch(() => undefined);
  const listed: string[] = await page.$$eval(
    '[data-testid="wb-review-draft"]',
    (els: Element[]) => els.map((e) => e.getAttribute('data-story') ?? '')
  );
  const missing = stories.filter((s) => !listed.includes(s));
  const send: SendResult = { ms: 0, edits: 0, byHand: 0, failures: [] };
  if (!(await page.$('[data-testid="wb-review-send"]'))) {
    send.failures.push('the Review page has no Send button');
    return { missing, send };
  }
  await page.click('[data-testid="wb-review-send"]');
  await page.click('[data-testid="wb-send-who-none"]', { timeout: 10000 });
  const t0 = Date.now();
  try {
    await page.waitForSelector('[data-testid="wb-send-text"]', {
      timeout: 30000,
    });
  } catch {
    send.failures.push('Send did not finish reading the code in 30 s');
    return { missing, send };
  }
  send.ms = Date.now() - t0;
  const text: string = await page.textContent('[data-testid="wb-send-text"]');
  const input = inputOfText(text) as { changes?: unknown[] } | undefined;
  send.input = input;
  send.edits = input?.changes?.length ?? 0;
  // "One change your agent makes by hand." / "N changes …": the typed
  // values and the edits that are not exact.
  const hand: string = await page
    .textContent('[data-testid="wb-send-diff"] p')
    .catch(() => '');
  send.byHand = /^One change/.test(hand ?? '')
    ? 1
    : Number(/^(\d+) changes/.exec(hand ?? '')?.[1] ?? 0);
  if (dryRun && input) {
    const script = path.join(__dirname, 'send.js');
    const d0 = Date.now();
    const r = spawnSync(process.execPath, [script, '--dry-run'], {
      input: JSON.stringify(input),
      encoding: 'utf8',
      timeout: 120000,
    });
    send.dryRun = {
      ms: Date.now() - d0,
      code: r.status,
      out: `${r.stdout ?? ''}${r.stderr ?? ''}`.trim(),
    };
    if (r.status !== 0)
      send.failures.push(`send.js --dry-run exit ${r.status}`);
  }
  return { missing, send };
};

const count = (sel?: Selection) => {
  const rows = (sel?.sections ?? []).flatMap((s) => s.rows);
  return {
    rows: rows.length,
    traced: rows.filter((r) => r.status === 'traced').length,
  };
};

export const table = (results: DemoResult[]): string =>
  results
    .map((x) => {
      const a = count(x.first);
      const b = count(x.text);
      const head = `${x.failures.length ? 'FAIL' : 'ok  '} ${x.component.padEnd(
        15
      )} first ${a.traced}/${a.rows} traced · text ${b.traced}/${
        b.rows
      } traced · ${x.edit ? `${x.edit.row} → ${x.edit.to}` : 'no change'} · ${(
        x.ms / 1000
      ).toFixed(1)} s`;
      return x.failures.length
        ? `${head}\n       ${x.failures.join('\n       ')}`
        : head;
    })
    .join('\n');

const arg = (name: string) => {
  const i = process.argv.indexOf(name);
  return i > -1 ? process.argv[i + 1] : undefined;
};

const main = async () => {
  const base = arg('--url');
  if (!base) {
    console.error('Usage: npm run ds:demo-check -- --url <storybook base>');
    process.exit(2);
  }
  const { chromium } = loadPlaywright();
  // The bot machine's guest has no user namespaces for the sandbox.
  const browser = await chromium.launch({
    chromiumSandbox: process.env.GV_CHROMIUM_SANDBOX === '1',
  });
  const results: DemoResult[] = [];
  const edit = !process.argv.includes('--no-edit');
  let review: Awaited<ReturnType<typeof checkReviewAndSend>> | undefined;
  try {
    const page = await browser.newPage({
      viewport: { width: 1440, height: 900 },
      colorScheme: 'light',
    });
    const list: typeof DEMO = arg('--stories')
      ? JSON.parse(fs.readFileSync(arg('--stories') as string, 'utf8'))
      : DEMO;
    for (const c of list) {
      try {
        results.push(await checkComponent(page, base, c, arg('--shots'), edit));
      } catch (e) {
        results.push({
          ...c,
          ms: 0,
          failures: [`error: ${(e as Error).message.split('\n')[0]}`],
        });
      }
    }
    if (edit)
      review = await checkReviewAndSend(
        page,
        base,
        results.filter((r) => r.edit).map((r) => r.story),
        process.argv.includes('--send-dry-run')
      );
  } finally {
    await browser.close();
  }
  console.log(table(results));
  const failed = results.filter((x) => x.failures.length).length;
  console.log(
    `\n${results.length - failed} of ${results.length} components pass`
  );
  const json = arg('--json');
  if (!edit) {
    if (json)
      fs.writeFileSync(json, `${JSON.stringify({ results }, null, 2)}\n`);
    process.exit(failed ? 1 : 0);
  }
  const { missing, send } = review ?? {
    missing: [],
    send: { ms: 0, edits: 0, byHand: 0, failures: ['not reached'] },
  };
  console.log(
    `Review: ${
      missing.length ? `missing ${missing.join(', ')}` : 'every change listed'
    }`
  );
  console.log(
    `Send: ready in ${(send.ms / 1000).toFixed(1)} s, ${
      send.edits
    } exact edits, ${send.byHand} by hand${
      send.dryRun
        ? `; dry run ${(send.dryRun.ms / 1000).toFixed(1)} s, exit ${
            send.dryRun.code
          }`
        : ''
    }${send.failures.length ? `; ${send.failures.join('; ')}` : ''}`
  );
  if (json) {
    fs.writeFileSync(
      json,
      `${JSON.stringify({ results, missing, send }, null, 2)}\n`
    );
  }
  process.exit(failed || missing.length || send.failures.length ? 1 : 0);
};

if (require.main === module) main();
