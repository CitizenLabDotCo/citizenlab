// Render every story once and write story-audit.json: whether it renders,
// errors or is blank, its console errors and how long it took.
//
//   npm run ds:audit-stories -- [--url http://127.0.0.1:8090/storybook/]
//                               [--out .storybook/static/story-audit.json]
//                               [--only <id,id>] only these stories; the
//                               other stories keep their last results
//
// Runs against a Storybook you serve (a static build or the dev server).
// One page on iframe.html; each story is switched in through Storybook's
// channel, as the workbench does, and waited for at most RENDER_MS. A
// story whose switch reloaded the page renders again on a fresh one. Per
// story it records:
// - rendered, or the error text (storyErrored, storyThrewException,
//   playFunctionThrewException, or no render in time);
// - blank: nothing under #storybook-root has a box, apart from the
//   preview's own wrappers (see STORY_WRAPPERS);
// - the console errors logged while it rendered;
// - ms: from the switch to the render event;
// - trace: what window.__wbTraceCoverage returns for the story's default
//   target, when the page has that hook, else null.
// The commit is CIRCLE_SHA1, else the checkout's HEAD: pass CIRCLE_SHA1
// when the build you audit is of another commit.
// Playwright is loaded through ./playwright (see there for GV_PLAYWRIGHT_DIR).
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

import { loadPlaywright } from './playwright';
import { SETTLED_PHASES, storyIdsFromIndex } from './visual-summary';

export const OUT_PATH = path.resolve(
  __dirname,
  '../../.storybook/static/story-audit.json'
);

// Longest wait for a story's render event.
export const RENDER_MS = 10000;

// Longest wait, after that event, for the story to finish (afterEach runs
// after storyRendered). The next switch must wait: tearing down a story
// that is still busy reloads the page.
const SETTLE_MS = 5000;

// The channel events that end a story's render.
export const END_EVENTS = [
  'storyRendered',
  'storyErrored',
  'storyThrewException',
  'playFunctionThrewException',
];

// The preview's own boxes around every story (.storybook/contexts): they
// always have a size, so they do not count against blank.
export const STORY_WRAPPERS = [
  '[data-gv-story-box]',
  '#modal-portal',
  '#mobile-nav-portal',
];

// At most this many console errors, each cut to ERROR_CHARS, per story.
const MAX_ERRORS = 10;
const ERROR_CHARS = 300;

export type TraceCoverage = { traced: number; total: number };

export type StoryAuditEntry = {
  rendered: boolean;
  error?: string;
  blank: boolean;
  consoleErrors: string[];
  ms: number;
  trace: TraceCoverage | null;
};

export type StoryAudit = {
  commit: string;
  measuredAt: string;
  stories: Record<string, StoryAuditEntry>;
};

export const parseAuditArgs = (argv: string[]) => {
  const out = {
    url: 'http://127.0.0.1:8090/storybook/',
    out: OUT_PATH,
    only: undefined as string[] | undefined,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const next = () => {
      if (i + 1 >= argv.length) throw new Error(`Missing value for ${a}`);
      return argv[++i];
    };
    if (a === '--url') out.url = next().replace(/\/*$/, '/');
    else if (a === '--out') out.out = path.resolve(next());
    else if (a === '--only') {
      out.only = next()
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    } else throw new Error(`Unknown argument ${a}`);
  }
  return out;
};

// The ids to audit, in order; --only ids the index lacks are an error.
export const selectIds = (all: string[], only?: string[]) => {
  if (!only) return all;
  const known = new Set(all);
  const missing = only.filter((id) => !known.has(id));
  if (missing.length > 0) {
    throw new Error(`Not in the story index: ${missing.join(', ')}`);
  }
  return [...new Set(only)].sort();
};

// One line of error text from a render event's payload.
export const errorText = (event: string, payload: unknown): string => {
  const p = (payload ?? {}) as {
    title?: string;
    description?: string;
    name?: string;
    message?: string;
  };
  const text =
    event === 'storyErrored'
      ? [p.title, p.description].filter(Boolean).join(': ')
      : [p.name, p.message].filter(Boolean).join(': ');
  const line = (text || event).split('\n')[0].trim();
  return event === 'playFunctionThrewException' ? `play: ${line}` : line;
};

// Cuts the error list of one story to MAX_ERRORS of ERROR_CHARS.
export const clipErrors = (errors: string[]) =>
  errors.slice(0, MAX_ERRORS).map((e) => e.slice(0, ERROR_CHARS));

// The file: stories sorted by id. A run with --only keeps the other
// stories of the previous file.
export const buildAudit = (
  commit: string,
  measuredAt: string,
  stories: Record<string, StoryAuditEntry>,
  previous?: StoryAudit | null
): StoryAudit => {
  const all = { ...(previous?.stories ?? {}), ...stories };
  return {
    commit,
    measuredAt,
    stories: Object.fromEntries(
      Object.keys(all)
        .sort()
        .map((id) => [id, all[id]])
    ),
  };
};

// Counts as the workbench shows them: an errored story is an error, a
// rendered one is blank or renders.
export const summarise = (audit: StoryAudit, slowest = 5) => {
  const entries = Object.entries(audit.stories);
  return {
    stories: entries.length,
    rendered: entries.filter(([, s]) => s.rendered && !s.blank).length,
    errors: entries.filter(([, s]) => !s.rendered).map(([id]) => id),
    blank: entries.filter(([, s]) => s.rendered && s.blank).map(([id]) => id),
    slowest: [...entries]
      .sort(([a, x], [b, y]) => y.ms - x.ms || a.localeCompare(b))
      .slice(0, slowest)
      .map(([id, s]) => ({ id, ms: s.ms })),
  };
};

const gitCommit = () => {
  if (process.env.CIRCLE_SHA1) return process.env.CIRCLE_SHA1;
  try {
    return execSync('git rev-parse HEAD', { cwd: __dirname }).toString().trim();
  } catch {
    return 'unknown';
  }
};

const readAudit = (file: string): StoryAudit | null => {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8')) as StoryAudit;
  } catch {
    return null;
  }
};

type Outcome = {
  event: string;
  payload: unknown;
  ms: number;
  blank: boolean;
  trace: TraceCoverage | null;
  traceError?: string;
  settled: boolean;
};

// In the page: switch to the story, wait for its render event and for the
// story to finish, then look at what it drew. Self-contained: Playwright
// sends it as source.
const renderInPage = (opts: {
  id: string;
  events: string[];
  wrappers: string[];
  timeout: number;
  settle: number;
  settledPhases: string[];
}): Promise<Outcome> =>
  new Promise((resolve) => {
    const w = window as any;
    const channel = w.__STORYBOOK_ADDONS_CHANNEL__;
    const started = performance.now();
    const handlers: [string, (p: unknown) => void][] = [];
    let timer = 0;
    // The story's default target, as the workbench's defaultTarget
    // (lib/inspect.ts): through wrappers that draw nothing and hold one
    // element.
    const defaultTarget = () => {
      const box = document.querySelector('[data-gv-story-box]');
      let el = box?.firstElementChild ?? null;
      const clear = (v: string) =>
        /^(transparent|rgba\(\d+,\d+,\d+,0\))?$/.test(v.replace(/\s/g, ''));
      while (el && el.children.length === 1) {
        const cs = getComputedStyle(el);
        if (
          !clear(cs.backgroundColor) ||
          parseFloat(cs.borderTopWidth) > 0 ||
          (!!cs.boxShadow && cs.boxShadow !== 'none')
        ) {
          break;
        }
        el = el.firstElementChild;
      }
      return el;
    };
    const finish = async (event: string, payload: unknown) => {
      const ms = Math.round(performance.now() - started);
      window.clearTimeout(timer);
      handlers.forEach(([e, h]) => channel.off(e, h));
      let settled = false;
      for (let waited = 0; waited <= opts.settle; waited += 25) {
        const phase = w.__STORYBOOK_PREVIEW__?.currentRender?.phase;
        if (opts.settledPhases.includes(phase)) {
          settled = true;
          break;
        }
        await new Promise((r) => window.setTimeout(r, 25));
      }
      const root = document.getElementById('storybook-root');
      const skip = opts.wrappers.join(',');
      const blank = ![...(root?.querySelectorAll('*') ?? [])].some((el) => {
        if (el.matches(skip)) return false;
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.height > 0;
      });
      let trace: TraceCoverage | null = null;
      let traceError: string | undefined;
      if (typeof w.__wbTraceCoverage === 'function') {
        try {
          trace = (await w.__wbTraceCoverage(defaultTarget())) ?? null;
        } catch (e) {
          traceError = String((e as Error)?.message ?? e);
        }
      }
      resolve({ event, payload, ms, blank, trace, traceError, settled });
    };
    opts.events.forEach((event) => {
      const h = (payload: unknown) => {
        // storyRendered names its story; the error events do not.
        if (event === 'storyRendered' && payload !== opts.id) return;
        finish(event, payload);
      };
      handlers.push([event, h]);
      channel.on(event, h);
    });
    timer = window.setTimeout(() => finish('timeout', null), opts.timeout);
    channel.emit('setCurrentStory', { storyId: opts.id, viewMode: 'story' });
  });

const main = async () => {
  const args = parseAuditArgs(process.argv.slice(2));
  const index = await (await fetch(`${args.url}index.json`)).json();
  const ids = selectIds(storyIdsFromIndex(index), args.only);
  console.log(`Auditing ${ids.length} stories at ${args.url}`);

  const { chromium } = loadPlaywright();
  const browser = await chromium.launch({
    chromiumSandbox: process.env.CI ? undefined : false,
  });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
  });
  // tsx keeps the names of functions by wrapping them in __name(), which
  // the page lacks: renderInPage's inner functions would throw there.
  await context.addInitScript({ content: 'window.__name = (f) => f;' });
  let current = '';
  const logged: string[] = [];
  let page: any;

  // A page on iframe.html with no story, ready for the channel.
  const openPage = async () => {
    if (page) await page.close().catch(() => undefined);
    page = await context.newPage();
    page.on('console', (m: any) => {
      if (m.type() !== 'error' || !current) return;
      // A failed load says which file only in its location.
      const url = m.location()?.url;
      logged.push(
        /^Failed to load resource/.test(m.text()) && url
          ? `${m.text()}: ${url}`
          : m.text()
      );
    });
    page.on('pageerror', (e: Error) => {
      if (current) logged.push(`${e.name}: ${e.message}`);
    });
    await page.goto(`${args.url}iframe.html`, { waitUntil: 'load' });
    await page.waitForFunction(
      () => !!(window as any).__STORYBOOK_PREVIEW__?.storyStoreValue,
      undefined,
      { timeout: 60000 }
    );
  };

  // One story on the open page. The page may hang on a story (a loop in
  // render): the page's own timer then never fires, so this one ends the
  // wait.
  const renderOne = async (id: string): Promise<Outcome> => {
    logged.length = 0;
    try {
      return await Promise.race([
        page.evaluate(renderInPage, {
          id,
          events: END_EVENTS,
          wrappers: STORY_WRAPPERS,
          timeout: RENDER_MS,
          settle: SETTLE_MS,
          settledPhases: SETTLED_PHASES,
        }) as Promise<Outcome>,
        new Promise<never>((_, reject) =>
          setTimeout(
            () => reject(new Error('page did not answer')),
            RENDER_MS + SETTLE_MS + 5000
          )
        ),
      ]);
    } catch (e) {
      return {
        event: 'failed',
        payload: { message: (e as Error).message.split('\n')[0] },
        ms: RENDER_MS,
        blank: true,
        trace: null,
        settled: false,
      };
    }
  };

  await openPage();
  const stories: Record<string, StoryAuditEntry> = {};
  const again: string[] = [];
  const started = Date.now();
  for (const [i, id] of ids.entries()) {
    current = id;
    let outcome = await renderOne(id);
    // The page reloaded during the switch. Storybook reloads when it tears
    // down a story that is still rendering, which the story before can be
    // (the pseudo-states addon renders a hover story a second time). That
    // says nothing about this story: it renders again on a fresh page.
    if (
      outcome.event === 'failed' &&
      /destroyed|navigat/i.test(errorText('failed', outcome.payload))
    ) {
      again.push(id);
      current = '';
      await openPage();
      current = id;
      outcome = await renderOne(id);
    }
    current = '';
    const rendered = outcome.event === 'storyRendered';
    stories[id] = {
      rendered,
      ...(rendered
        ? {}
        : {
            error:
              outcome.event === 'timeout'
                ? `no render event within ${RENDER_MS / 1000}s`
                : errorText(outcome.event, outcome.payload),
          }),
      blank: outcome.blank,
      consoleErrors: clipErrors(
        outcome.traceError
          ? [...logged, `trace: ${outcome.traceError}`]
          : [...logged]
      ),
      ms: outcome.ms,
      trace: outcome.trace,
    };
    // A page that did not answer, crashed, or holds a story still busy
    // starts again, so the next story is not charged for it.
    if (!outcome.settled) await openPage();
    if ((i + 1) % 50 === 0) {
      const secs = Math.round((Date.now() - started) / 1000);
      console.log(`  ${i + 1}/${ids.length} in ${secs}s`);
    }
  }
  await browser.close();

  const audit = buildAudit(
    gitCommit(),
    new Date().toISOString(),
    stories,
    args.only ? readAudit(args.out) : null
  );
  fs.mkdirSync(path.dirname(args.out), { recursive: true });
  fs.writeFileSync(args.out, `${JSON.stringify(audit, null, 2)}\n`);

  const s = summarise({ ...audit, stories });
  console.log(
    `story audit written to ${path.relative(process.cwd(), args.out)}`
  );
  console.log(
    `${s.stories} stories: ${s.rendered} render, ${s.errors.length} error, ${s.blank.length} blank`
  );
  console.log(
    `slowest: ${s.slowest.map((x) => `${x.id} ${x.ms}ms`).join(', ')}`
  );
  if (again.length > 0) {
    console.log(
      `${
        again.length
      } rendered again on a fresh page, the switch to them reloaded the page: ${again.join(
        ', '
      )}`
    );
  }
  s.errors.forEach((id) => console.log(`  ERROR ${id}: ${stories[id].error}`));
  s.blank.forEach((id) => console.log(`  BLANK ${id}`));
};

if (require.main === module) {
  main().catch((e) => {
    console.error(e);
    process.exit(2);
  });
}
