// Screenshot every story and either save a baseline or compare to one.
//
//   npm run ds:visual -- --baseline <dir> --url http://localhost:6006
//   npm run ds:visual -- --compare  <dir> --url http://localhost:6006 [--allow-px N]
//   [--stories <glob,glob>] only the story ids that match (`*` is a wildcard)
//   [--mode today|redesign] token mode to render in (default today)
//
// A run with --stories or --mode redesign covers part of the workbench, so
// its compare summary goes to <dir>/_summary.json unless --summary says
// otherwise; only a full today run updates the committed visual-summary.json.
//
// Playwright is loaded through ./playwright (see there for GV_PLAYWRIGHT_DIR).
import fs from 'fs';
import path from 'path';

import { loadPlaywright } from './playwright';
import {
  buildSummary,
  matchStories,
  parseArgs,
  PIXELMATCH_OPTIONS,
  PLAY_ERROR_EVENT,
  SETTLED_PHASES,
  shotName,
  storyIdsFromIndex,
  VIEWPORTS,
} from './visual-summary';

const SUMMARY_PATH = path.resolve(
  __dirname,
  '../../.storybook/static/visual-summary.json'
);

const NO_ANIMATION_CSS = `*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important;scroll-behavior:auto!important}`;

type Result = { id: string; viewport: string; px?: number; error?: string };

const main = async () => {
  const args = parseArgs(process.argv.slice(2));
  const dir = path.resolve((args.baseline ?? args.compare) as string);
  const saving = !!args.baseline;
  fs.mkdirSync(dir, { recursive: true });
  const diffDir = path.join(dir, '_diff');
  const retryDir = path.join(dir, '_retry');
  if (!saving) {
    fs.mkdirSync(diffDir, { recursive: true });
    fs.mkdirSync(retryDir, { recursive: true });
  }

  const { chromium } = loadPlaywright();
  const { PNG } = await import('pngjs');
  const pixelmatch = (await import('pixelmatch')).default;

  const index = await (await fetch(`${args.url}/index.json`)).json();
  const all = storyIdsFromIndex(index);
  const ids = matchStories(all, args.stories);
  if (ids.length === 0) {
    console.error(`No story id matches --stories ${args.stories}`);
    process.exit(2);
  }
  const partial = ids.length < all.length || args.mode !== 'today';
  console.log(
    `${ids.length} stories${
      ids.length < all.length ? ` of ${all.length}` : ''
    }, ${VIEWPORTS.length} viewports, mode ${args.mode}`
  );

  // Partial raster repaints only the changed part of a tile, so a border
  // that changes color after the first paint (an error state set in an
  // effect, say) can keep corner pixels one shade off, in about one run in
  // five. Full raster gives the same pixels every run.
  const browser = await chromium.launch({
    chromiumSandbox: false,
    args: ['--disable-partial-raster'],
  });
  const results: Result[] = [];
  const flaky: { id: string; viewport: string; first: number; second: number }[] = [];

  const capture = async (page: any, id: string): Promise<Buffer> => {
    try {
      await page.goto(
        `${args.url}/iframe.html?id=${encodeURIComponent(id)}&viewMode=story&globals=mode:${args.mode}`,
        { waitUntil: 'load' }
      );
      await page.addStyleTag({ content: NO_ANIMATION_CSS });
      await page
        .waitForFunction(
          () =>
            [...(document.querySelector('#storybook-root')?.children ?? [])].some(
              (c) => c.id !== 'modal-portal' && c.id !== 'mobile-nav-portal'
            ) || !!document.querySelector('.sb-errordisplay'),
          undefined,
          { timeout: 15000 }
        )
        .catch(() => {});
      // Wait until the preview reports the story rendered and its play
      // function done. Stories that wait for data in a play step (an app
      // configuration fetch, say) are only complete from then on.
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
      if (!settled) {
        const phase = await page.evaluate(
          () => (window as any).__STORYBOOK_PREVIEW__?.currentRender?.phase
        );
        throw new Error(`render not settled after 20s (phase ${phase})`);
      }
      const playError: string = await page.evaluate(
        () => (window as any).__gvPlayError
      );
      if (playError) {
        throw new Error(`play failed: ${playError.split('\n')[0]}`);
      }
      await page.waitForLoadState('networkidle', { timeout: 2000 }).catch(() => {});
      await page.evaluate(() => (document as any).fonts.ready);
      await page.waitForTimeout(150);
      const failed = await page.evaluate(() => {
        const err = document.querySelector('.sb-errordisplay');
        const shown = err && getComputedStyle(err).display !== 'none';
        return shown ? (err as HTMLElement).innerText.slice(0, 200) : '';
      });
      if (failed) throw new Error(`story error: ${failed.replace(/\s+/g, ' ')}`);
      const empty = await page.evaluate(
        () =>
          [...(document.querySelector('#storybook-root')?.children ?? [])].filter(
            (c) => c.id !== 'modal-portal' && c.id !== 'mobile-nav-portal'
          ).length === 0
      );
      if (empty) throw new Error('empty #storybook-root');
      // Most stories sit in an absolutely positioned wrapper, so the root
      // itself can have no height. Fall back to the full page then.
      const root = page.locator('#storybook-root');
      const box = await root.boundingBox();
      if (!box || box.width === 0 || box.height === 0) {
        return await page.screenshot({ fullPage: true, animations: 'disabled', timeout: 20000 });
      }
      return await root.screenshot({ animations: 'disabled', timeout: 20000 });
    } finally {
      // nothing to clean up
    }
  };

  const diffPx = (a: Buffer, b: Buffer, outPath?: string): number => {
    const A = PNG.sync.read(a);
    const B = PNG.sync.read(b);
    if (A.width !== B.width || A.height !== B.height) {
      throw new Error(`size changed ${A.width}x${A.height} -> ${B.width}x${B.height}`);
    }
    const out = new PNG({ width: A.width, height: A.height });
    const px = pixelmatch(A.data, B.data, out.data, A.width, A.height, PIXELMATCH_OPTIONS);
    if (px > 0 && outPath) fs.writeFileSync(outPath, PNG.sync.write(out));
    return px;
  };

  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 1,
      reducedMotion: 'reduce',
    });
    // Record a play function that throws (a play step that waited in vain
    // for data, say). The listener goes on the preview channel as soon as it
    // exists, before the story renders.
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
    const page = await context.newPage();
    for (const id of ids) {
      const name = shotName(vp.name, id, args.mode);
      const file = path.join(dir, name);
      try {
        const shot = await capture(page, id);
        if (saving) {
          fs.writeFileSync(file, shot);
          results.push({ id, viewport: vp.name, px: 0 });
          continue;
        }
        if (!fs.existsSync(file)) throw new Error('no baseline screenshot');
        const base = fs.readFileSync(file);
        let px = diffPx(base, shot, path.join(diffDir, name));
        if (px > args.allowPx) {
          // Re-run once to tell flakiness from a real difference.
          const again = await capture(page, id);
          const second = diffPx(base, again, path.join(retryDir, name));
          flaky.push({ id, viewport: vp.name, first: px, second });
          if (second <= args.allowPx) px = second;
        }
        results.push({ id, viewport: vp.name, px });
      } catch (e) {
        results.push({ id, viewport: vp.name, error: (e as Error).message });
      }
    }
    await context.close();
  }
  await browser.close();

  if (saving) {
    const errs = results.filter((r) => r.error);
    console.log(`baseline saved to ${dir}: ${results.length - errs.length} ok, ${errs.length} errors`);
    errs.forEach((r) => console.log(`  ERROR ${r.viewport} ${r.id}: ${r.error}`));
    fs.writeFileSync(path.join(dir, '_errors.json'), JSON.stringify(errs, null, 2));
    process.exitCode = errs.length > 0 ? 1 : 0;
    return;
  }

  const summary = buildSummary(ids.length, results, args.allowPx, flaky.length);
  const out = args.summary
    ? path.resolve(args.summary)
    : partial
    ? path.join(dir, '_summary.json')
    : SUMMARY_PATH;
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, `${JSON.stringify(summary, null, 2)}\n`);
  fs.writeFileSync(path.join(dir, '_flaky.json'), JSON.stringify(flaky, null, 2));
  console.log(`summary written to ${out}`);
  console.log(
    `compared ${ids.length} stories x ${VIEWPORTS.length} viewports: ${summary.diffs.length} diffs, ${summary.errors.length} errors, ${flaky.length} retried`
  );
  summary.diffs.forEach((d) => console.log(`  DIFF ${d.viewport} ${d.id}: ${d.px}px`));
  summary.errors.forEach((d) => console.log(`  ERROR ${d.viewport} ${d.id}: ${d.message}`));
  flaky.forEach((f) => console.log(`  retried ${f.viewport} ${f.id}: ${f.first}px then ${f.second}px`));
  process.exitCode = summary.diffs.length > 0 || summary.errors.length > 0 ? 1 : 0;
};

main().catch((e) => {
  console.error(e);
  process.exit(2);
});
