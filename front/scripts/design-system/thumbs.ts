// Picture thumbnails for the workbench galleries: one picture of each
// gallery card's story, taken from a static Storybook build, so a gallery
// shows pictures at once instead of booting a preview per card.
//
//   npm run ds:thumbs -- [--dir storybook-static] [--concurrency 3]
//                        [--only <story id prefix>]
//
// Writes <dir>/thumbs/<story>.png and <dir>/thumbs.json. A card with no
// picture (a failed one, or a build without this step) renders live, as
// before. Run it after build-storybook; CI does, on design-system branches.
import fs from 'fs';
import http from 'http';
import { AddressInfo } from 'net';
import path from 'path';

import { DEFAULT_CITY } from '../../.storybook/cities';
import {
  THUMB_DPR,
  THUMB_INSET,
  ThumbManifest,
  thumbFile,
  thumbViewport,
} from '../../.storybook/workbench/src/lib/thumbs';
import { buildGroups } from '../../.storybook/workbench/src/lib/stories';

import { loadPlaywright } from './playwright';

import type {
  ScanOutput,
  StoryIndex,
} from '../../.storybook/workbench/src/lib/data';

const GLOBALS = { city: DEFAULT_CITY, lang: 'en' };

// Longest wait for a story to finish (its play function included) before
// its picture is taken anyway.
const RENDER_MS = 10000;

// After the story finishes: images and fonts settle, menus finish opening.
const SETTLE_MS = 400;

// Phases after which a render does no more.
const DONE = ['finished', 'errored', 'aborted', 'playErrored'];

// As a live card: the story clear of the edges, on a transparent page.
const THUMB_CSS = [
  'html,body{background:transparent!important;overflow:hidden!important}',
  `#storybook-root{position:fixed!important;inset:${THUMB_INSET}px!important}`,
  '*,*::before,*::after{transition:none!important;animation:none!important;caret-color:transparent!important}',
].join('');

const TYPES: Record<string, string> = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
};

const arg = (name: string) => {
  const i = process.argv.indexOf(`--${name}`);
  return i === -1 ? undefined : process.argv[i + 1];
};

const serve = (root: string): Promise<http.Server> =>
  new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const urlPath = decodeURIComponent((req.url ?? '/').split('?')[0]);
      let file = path.resolve(root, `.${urlPath}`);
      const rel = path.relative(root, file);
      if (rel.startsWith('..') || path.isAbsolute(rel)) {
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
    server.listen(0, '127.0.0.1', () => resolve(server));
  });

const main = async () => {
  const root = path.resolve(arg('dir') ?? 'storybook-static');
  const concurrency = Math.max(1, Number(arg('concurrency') ?? 3));
  const only = arg('only');
  const index: StoryIndex = JSON.parse(
    fs.readFileSync(path.join(root, 'index.json'), 'utf8')
  );
  const groups = buildGroups(index, {
    components: [],
  } as unknown as ScanOutput).filter(
    (g) => !only || g.defaultId.startsWith(only)
  );
  const out = path.join(root, 'thumbs');
  fs.mkdirSync(out, { recursive: true });

  const server = await serve(root);
  const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  const { chromium } = loadPlaywright();
  const browser = await chromium.launch({
    chromiumSandbox: process.env.CI ? undefined : false,
  });
  // A run with --only keeps the other pictures of the last run.
  const previous = path.join(root, 'thumbs.json');
  const manifest: ThumbManifest =
    only && fs.existsSync(previous)
      ? JSON.parse(fs.readFileSync(previous, 'utf8'))
      : { globals: GLOBALS, thumbs: {} };
  const failed: string[] = [];
  const g = Object.entries(GLOBALS)
    .map(([k, v]) => `${k}:${encodeURIComponent(v)}`)
    .join(';');
  const queue = [...groups];
  const started = Date.now();

  const worker = async () => {
    for (let group = queue.shift(); group; group = queue.shift()) {
      const id = group.defaultId;
      const viewport = thumbViewport(group.section);
      const context = await browser.newContext({
        viewport,
        deviceScaleFactor: THUMB_DPR,
        reducedMotion: 'reduce',
      });
      const page = await context.newPage();
      try {
        await page.goto(
          `${base}/iframe.html?id=${encodeURIComponent(
            id
          )}&viewMode=story&globals=${g}`,
          { waitUntil: 'load' }
        );
        await page.addStyleTag({ content: THUMB_CSS });
        await page
          .waitForFunction(
            (done: string[]) => {
              const render = (window as any).__STORYBOOK_PREVIEW__
                ?.currentRender;
              return render && done.includes(render.phase);
            },
            DONE,
            { timeout: RENDER_MS, polling: 100 }
          )
          .catch(() => undefined);
        await page.evaluate(() => document.fonts?.ready);
        await page.waitForTimeout(SETTLE_MS);
        const file = thumbFile(id);
        await page.screenshot({
          path: path.join(out, file),
          omitBackground: true,
        });
        manifest.thumbs[id] = { file, ...viewport };
      } catch (e) {
        failed.push(`${id}: ${(e as Error).message.split('\n')[0]}`);
      } finally {
        await context.close();
      }
    }
  };

  await Promise.all(Array.from({ length: concurrency }, worker));
  await browser.close();
  server.close();

  fs.writeFileSync(
    path.join(root, 'thumbs.json'),
    `${JSON.stringify(manifest)}\n`
  );
  const secs = Math.round((Date.now() - started) / 1000);
  console.log(
    `ds:thumbs: ${Object.keys(manifest.thumbs).length} of ${
      groups.length
    } pictures in ${secs}s, in ${path.relative(process.cwd(), out)}/`
  );
  failed.forEach((f) => console.log(`  failed (renders live): ${f}`));
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
