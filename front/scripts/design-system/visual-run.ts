// Screenshot every story and either save a baseline or compare to one.
//
//   npm run ds:visual -- --baseline <dir> --url http://localhost:6006
//   npm run ds:visual -- --compare  <dir> --url http://localhost:6006 [--allow-px N]
//
// Playwright is not a repo dependency. Point GV_PLAYWRIGHT_DIR at a directory
// that contains node_modules/playwright, or install playwright so that a
// normal require resolves it. Browsers come from PLAYWRIGHT_BROWSERS_PATH.
import fs from 'fs';
import { createRequire } from 'module';
import path from 'path';

import {
  buildSummary,
  parseArgs,
  storyIdsFromIndex,
  VIEWPORTS,
} from './visual-summary';

const SUMMARY_PATH = path.resolve(
  __dirname,
  '../../.storybook/static/visual-summary.json'
);

const NO_ANIMATION_CSS = `*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important;scroll-behavior:auto!important}`;

const loadPlaywright = () => {
  const dir = process.env.GV_PLAYWRIGHT_DIR;
  const tries = [
    () => createRequire(path.join(dir as string, 'noop.js'))('playwright'),
    () => require('playwright'),
  ];
  for (const t of dir ? tries : tries.slice(1)) {
    try {
      return t();
    } catch {
      // try the next resolution
    }
  }
  console.error(
    'Playwright not found. Set GV_PLAYWRIGHT_DIR to a directory containing node_modules/playwright (and PLAYWRIGHT_BROWSERS_PATH to its browsers), or install playwright.'
  );
  process.exit(2);
};

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
  const ids = storyIdsFromIndex(index);
  console.log(`${ids.length} stories, ${VIEWPORTS.length} viewports`);

  const browser = await chromium.launch({ chromiumSandbox: false });
  const results: Result[] = [];
  const flaky: { id: string; viewport: string; first: number; second: number }[] = [];

  const capture = async (page: any, id: string): Promise<Buffer> => {
    const errors: string[] = [];
    const onErr = (e: Error) => errors.push(e.message);
    page.on('pageerror', onErr);
    try {
      await page.goto(
        `${args.url}/iframe.html?id=${encodeURIComponent(id)}&viewMode=story&globals=mode:today`,
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
      page.off('pageerror', onErr);
    }
  };

  const diffPx = (a: Buffer, b: Buffer, outPath?: string): number => {
    const A = PNG.sync.read(a);
    const B = PNG.sync.read(b);
    if (A.width !== B.width || A.height !== B.height) {
      throw new Error(`size changed ${A.width}x${A.height} -> ${B.width}x${B.height}`);
    }
    const out = new PNG({ width: A.width, height: A.height });
    const px = pixelmatch(A.data, B.data, out.data, A.width, A.height, { threshold: 0.1 });
    if (px > 0 && outPath) fs.writeFileSync(outPath, PNG.sync.write(out));
    return px;
  };

  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 1,
      reducedMotion: 'reduce',
    });
    const page = await context.newPage();
    for (const id of ids) {
      const file = path.join(dir, `${vp.name}__${id}.png`);
      try {
        const shot = await capture(page, id);
        if (saving) {
          fs.writeFileSync(file, shot);
          results.push({ id, viewport: vp.name, px: 0 });
          continue;
        }
        if (!fs.existsSync(file)) throw new Error('no baseline screenshot');
        const base = fs.readFileSync(file);
        let px = diffPx(base, shot, path.join(diffDir, `${vp.name}__${id}.png`));
        if (px > args.allowPx) {
          // Re-run once to tell flakiness from a real difference.
          const again = await capture(page, id);
          const second = diffPx(base, again, path.join(retryDir, `${vp.name}__${id}.png`));
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
    return;
  }

  const summary = buildSummary(ids.length, results, args.allowPx);
  const out = args.summary ? path.resolve(args.summary) : SUMMARY_PATH;
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, `${JSON.stringify(summary, null, 2)}\n`);
  fs.writeFileSync(path.join(dir, '_flaky.json'), JSON.stringify(flaky, null, 2));
  console.log(
    `compared ${ids.length} stories x ${VIEWPORTS.length} viewports: ${summary.diffs.length} diffs, ${summary.errors.length} errors, ${flaky.length} retried`
  );
  summary.diffs.forEach((d) => console.log(`  DIFF ${d.viewport} ${d.id}: ${d.px}px`));
  summary.errors.forEach((d) => console.log(`  ERROR ${d.viewport} ${d.id}: ${d.message}`));
  flaky.forEach((f) => console.log(`  retried ${f.viewport} ${f.id}: ${f.first}px then ${f.second}px`));
  process.exitCode = summary.diffs.length > 0 ? 1 : 0;
};

main().catch((e) => {
  console.error(e);
  process.exit(2);
});
