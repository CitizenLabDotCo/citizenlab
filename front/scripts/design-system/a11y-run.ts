// Run axe on every story and write a11y-results.json, or check the results.
//
//   npm run ds:a11y -- --url http://localhost:6006
//   [--stories <glob,glob>] only the story ids that match (`*` a wildcard);
//                           the other stories keep their last results
//   [--workers N]           pages in parallel (default 4)
//   [--out <file>]          write somewhere else than the committed file
//   npm run ds:a11y -- --check
//                           exit 1 on a critical violation in a story under
//                           Components/ that is not in a11y-known.json, on a
//                           known one that no longer fails or whose story
//                           errored, or on no results (ds:check runs this)
//
// Each story renders at 1280x900. axe-core comes from
// node_modules and runs the WCAG 2.0, 2.1 and 2.2 A and AA rules on the
// story and its portals, without the rules about Storybook's iframe page.
// Playwright is loaded through ./playwright (see there for GV_PLAYWRIGHT_DIR).
import fs from 'fs';
import path from 'path';

import {
  A11yResults,
  AXE_TAGS,
  countByImpact,
  criticalFailures,
  erroredStories,
  FOCUSABLE_SELECTOR,
  KnownCritical,
  mergeResults,
  PAGE_RULES,
  parseA11yArgs,
  STORYBOOK_CHROME,
  splitKnown,
  StoryResult,
  summariseViolations,
} from './a11y-results';
import { loadPlaywright } from './playwright';
import {
  matchStories,
  PLAY_ERROR_EVENT,
  SETTLED_PHASES,
} from './visual-summary';

const RESULTS_PATH = path.resolve(
  __dirname,
  '../../.storybook/static/a11y-results.json'
);

type IndexEntry = { id: string; title: string; type?: string };

const readResults = (file: string): A11yResults | null => {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8')) as A11yResults;
  } catch {
    return null;
  }
};

const KNOWN_PATH = path.resolve(__dirname, 'a11y-known.json');

const readKnown = (): KnownCritical[] => {
  try {
    return (
      JSON.parse(fs.readFileSync(KNOWN_PATH, 'utf8')) as {
        known: KnownCritical[];
      }
    ).known;
  } catch {
    return [];
  }
};

const check = (file: string) => {
  const rel = (f: string) => path.relative(process.cwd(), f);
  const results = readResults(file);
  if (!results) {
    console.error(`a11y: no results at ${rel(file)}; run npm run ds:a11y.`);
    return 1;
  }
  const { fresh, known, fixed, unchecked } = splitKnown(
    criticalFailures(results),
    readKnown(),
    erroredStories(results)
  );
  const date = results.generatedAt.slice(0, 10);
  if (fresh.length > 0) {
    console.error(
      `a11y: ${fresh.length} new critical axe violations in Components/ stories (results of ${date}):`
    );
    fresh.forEach((f) =>
      console.error(`  ${f.id}: ${f.rule} (${f.nodes} elements) ${f.help}`)
    );
  }
  if (fixed.length > 0) {
    console.error(
      `a11y: ${
        fixed.length
      } known criticals no longer fail; remove them from ${rel(KNOWN_PATH)}:`
    );
    fixed.forEach((k) => console.error(`  ${k.id}: ${k.rule}`));
  }
  if (unchecked.length > 0) {
    console.error(
      `a11y: ${
        unchecked.length
      } known criticals could not be checked because their story errored; keep their entries in ${rel(
        KNOWN_PATH
      )}, fix the story, then run npm run ds:a11y -- --stories '<id>':`
    );
    unchecked.forEach((k) =>
      console.error(`  ${k.id}: ${k.rule} (error: ${k.error})`)
    );
  }
  if (fresh.length > 0 || fixed.length > 0 || unchecked.length > 0) return 1;
  console.log(
    `a11y: no new critical axe violation in Components/ stories (results of ${date}); ${
      known.length
    } known ones remain in ${rel(KNOWN_PATH)}`
  );
  return 0;
};

const main = async () => {
  const args = parseA11yArgs(process.argv.slice(2));
  const out = args.out ? path.resolve(args.out) : RESULTS_PATH;
  if (args.check) {
    process.exitCode = check(out);
    return;
  }

  const { chromium } = loadPlaywright();
  const axePath = require.resolve('axe-core/axe.min.js');
  const axeVersion = JSON.parse(
    fs.readFileSync(path.join(path.dirname(axePath), 'package.json'), 'utf8')
  ).version as string;

  const index = await (await fetch(`${args.url}/index.json`)).json();
  const entries = Object.values(
    (index.entries ?? {}) as Record<string, IndexEntry>
  ).filter((e) => e.type === 'story');
  const titles = new Map(entries.map((e) => [e.id, e.title]));
  const all = entries.map((e) => e.id).sort();
  const ids = matchStories(all, args.stories);
  if (ids.length === 0) {
    console.error(`No story id matches --stories ${args.stories}`);
    process.exit(2);
  }
  console.log(
    `axe ${axeVersion} on ${ids.length} stories${
      ids.length < all.length ? ` of ${all.length}` : ''
    }, ${args.workers} pages in parallel`
  );

  const browser = await chromium.launch({ chromiumSandbox: false });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    deviceScaleFactor: 1,
    reducedMotion: 'reduce',
  });
  // Record a play function that throws (see visual-run.ts).
  await context.addInitScript((event: string) => {
    const w = window as any;
    w.__gvPlayError = '';
    const timer = setInterval(() => {
      const channel = w.__STORYBOOK_ADDONS_CHANNEL__;
      if (!channel) return;
      clearInterval(timer);
      channel.on(event, (error: { message?: string }) => {
        w.__gvPlayError = String(error.message ?? 'unknown error');
      });
    }, 1);
  }, PLAY_ERROR_EVENT);

  const stories: Record<string, StoryResult> = {};

  const runOne = async (page: any, id: string): Promise<StoryResult> => {
    const base = {
      title: titles.get(id) ?? '',
      checkedAt: new Date().toISOString(),
      violations: [],
      passes: 0,
      incomplete: 0,
      focusable: 0,
    };
    try {
      await page.goto(
        `${args.url}/iframe.html?id=${encodeURIComponent(
          id
        )}&viewMode=story`,
        { waitUntil: 'load' }
      );
      const settled = await page
        .waitForFunction(
          (phases: string[]) =>
            phases.includes(
              (window as any).__STORYBOOK_PREVIEW__?.currentRender?.phase
            ),
          SETTLED_PHASES,
          { timeout: 20000 }
        )
        .then(() => true)
        .catch(() => false);
      if (!settled) throw new Error('render not settled after 20s');
      await page
        .waitForLoadState('networkidle', { timeout: 2000 })
        .catch(() => {});
      const story = await page.evaluate(() => {
        const w = window as any;
        const err = document.querySelector('.sb-errordisplay');
        const shown = err && getComputedStyle(err).display !== 'none';
        return {
          hasPlay:
            !!w.__STORYBOOK_PREVIEW__?.currentRender?.story?.playFunction,
          playError: String(w.__gvPlayError ?? ''),
          error: shown ? (err as HTMLElement).innerText.slice(0, 200) : '',
        };
      });
      if (story.error) {
        throw new Error(`story error: ${story.error.replace(/\s+/g, ' ')}`);
      }
      await page.addScriptTag({ path: axePath });
      const axe = await page.evaluate(
        async (opts: {
          tags: string[];
          pageRules: string[];
          chrome: string[];
        }) => {
          const run = await (window as any).axe.run(
            { include: [document.body], exclude: opts.chrome.map((s) => [s]) },
            {
              runOnly: { type: 'tag', values: opts.tags },
              rules: Object.fromEntries(
                opts.pageRules.map((r) => [r, { enabled: false }])
              ),
              resultTypes: ['violations'],
            }
          );
          return {
            violations: run.violations.map((v: any) => ({
              id: v.id,
              impact: v.impact,
              help: v.help,
              helpUrl: v.helpUrl,
              nodes: v.nodes.map(() => 0),
            })),
            passes: run.passes.length,
            incomplete: run.incomplete.length,
          };
        },
        { tags: AXE_TAGS, pageRules: PAGE_RULES, chrome: STORYBOOK_CHROME }
      );
      const focusable: number = await page.evaluate(
        (opts: { sel: string; chrome: string[] }) => {
          const chrome = opts.chrome.join(', ');
          return [
            ...document.body.querySelectorAll<HTMLElement>(opts.sel),
          ].filter(
            (el) =>
              !el.closest(chrome) &&
              el.getClientRects().length > 0 &&
              getComputedStyle(el).visibility !== 'hidden'
          ).length;
        },
        { sel: FOCUSABLE_SELECTOR, chrome: STORYBOOK_CHROME }
      );
      return {
        ...base,
        violations: summariseViolations(axe.violations),
        passes: axe.passes,
        incomplete: axe.incomplete,
        focusable,
        ...(story.hasPlay
          ? {
              play: story.playError ? ('failed' as const) : ('passed' as const),
            }
          : {}),
      };
    } catch (e) {
      return { ...base, error: (e as Error).message.split('\n')[0] };
    }
  };

  const queue = [...ids];
  let done = 0;
  const worker = async () => {
    const page = await context.newPage();
    for (let id = queue.shift(); id; id = queue.shift()) {
      stories[id] = await runOne(page, id);
      done++;
      if (done % 25 === 0) console.log(`  ${done}/${ids.length}`);
    }
    await page.close();
  };
  await Promise.all(
    Array.from({ length: Math.min(args.workers, ids.length) }, worker)
  );
  await browser.close();

  const results = mergeResults(
    readResults(out),
    {
      generatedAt: new Date().toISOString(),
      axe: axeVersion,
      tags: AXE_TAGS,
      stories,
    },
    ids.length === all.length
  );
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, `${JSON.stringify(results, null, 2)}\n`);

  const counts = countByImpact({ ...results, stories });
  console.log(`results written to ${out}`);
  console.log(
    `${counts.stories} stories: ${counts.clean} without violations, ` +
      `${counts.critical} with critical, ${counts.serious} serious, ` +
      `${counts.moderate} moderate, ${counts.minor} minor; ${counts.errors} not checked`
  );
  Object.entries(stories)
    .filter(([, s]) => s.error)
    .forEach(([id, s]) => console.log(`  ERROR ${id}: ${s.error}`));
  Object.entries(stories)
    .filter(([, s]) => s.play === 'failed')
    .forEach(([id]) => console.log(`  PLAY FAILED ${id}`));
  process.exitCode = check(out) || (counts.errors > 0 ? 1 : 0);
};

main().catch((e) => {
  console.error(e);
  process.exit(2);
});
