// Pictures of the components the platform uses that have no story, cropped
// from the running platform, for the Components page's In use list.
//
//   npm run ds:crops [-- --url http://localhost:3000] [--session <state.json>]
//                    [--only Name,Name] [--max-routes N]
//
// Needs `npm run ds:local` running: only a dev build tells which file
// rendered an element (React's _debugSource). Without --session (a
// Playwright storage state of a logged-in admin on the test platform) it
// opens routes outside the admin only. Writes .storybook/static/crops/ and
// crops.json there; a run keeps the pictures it did not retake.
import fs from 'fs';
import path from 'path';

import { Crop, cropSlug, planCrops, ScanComponent } from './crops-plan';
import { loadPlaywright } from './playwright';

const STATIC = path.resolve(__dirname, '../../.storybook/static');
const OUT = path.join(STATIC, 'crops');
const INDEX = path.join(STATIC, 'crops.json');
const PAD = 8;
const MAX = { width: 960, height: 640 };

const arg = (name: string) => {
  const i = process.argv.indexOf(`--${name}`);
  return i === -1 ? undefined : process.argv[i + 1];
};

const normalise = (p?: string) => p?.replace(/^\.\//, '');

// In the page: per file, the boxes of its outermost rendered elements (an
// element whose nearest JSX site is in the file, under a parent whose is
// not). Runs in the browser, so it carries its own helpers.
const findInPage = (files: string[]) => {
  const fiberOf = (el: Element): any => {
    const key = Object.keys(el).find((k) => k.startsWith('__reactFiber$'));
    return key ? (el as any)[key] : undefined;
  };
  const fileOf = (el: Element): string | undefined => {
    let f = fiberOf(el);
    for (let i = 0; f && i < 60; i++) {
      const name: string | undefined = f._debugSource?.fileName;
      if (name && !/\/node_modules\//.test(name)) {
        const m = name.match(/(?:^|\/)(app\/.+)$/);
        return m ? m[1] : undefined;
      }
      f = f.return;
    }
    return undefined;
  };
  const want = new Set(files);
  const out: Record<string, { x: number; y: number; w: number; h: number }[]> =
    {};
  for (const el of Array.from(document.body.querySelectorAll('*'))) {
    const file = fileOf(el);
    if (!file || !want.has(file)) continue;
    if (el.parentElement && fileOf(el.parentElement) === file) continue;
    const r = el.getBoundingClientRect();
    const style = getComputedStyle(el);
    if (r.width < 12 || r.height < 12 || style.visibility === 'hidden') {
      continue;
    }
    (out[file] ??= []).push({
      x: r.left + window.scrollX,
      y: r.top + window.scrollY,
      w: r.width,
      h: r.height,
    });
  }
  return out;
};

const main = async () => {
  const url = (arg('url') ?? 'http://localhost:3000').replace(/\/+$/, '');
  const session = arg('session');
  const only = arg('only')?.split(',');
  const maxRoutes = Number(arg('max-routes') ?? 60);

  const scan = JSON.parse(
    fs.readFileSync(path.join(STATIC, 'design-scan.json'), 'utf8')
  ) as { components: ScanComponent[] };
  const fixture = JSON.parse(
    fs.readFileSync(path.join(STATIC, 'routes.fixture.json'), 'utf8')
  ) as { locale: string };
  const index = await (await fetch(`${url}/storybook/index.json`)).json();
  const entries = Object.values(index.entries ?? {}) as {
    title: string;
    componentPath?: string;
  }[];
  const titled = new Set(
    entries
      .filter((e) => e.title.startsWith('Components/'))
      .map((e) => e.title.split('/').pop())
  );
  const storyFiles = new Set<string>([
    ...entries.map((e) => normalise(e.componentPath) ?? ''),
    ...scan.components
      .filter((c) => titled.has(c.component))
      .map((c) => c.file),
  ]);

  const plan = planCrops(scan.components, storyFiles, {
    session: !!session,
    only,
  });
  const byName = new Map(scan.components.map((c) => [c.component, c]));
  const crops: Record<string, Crop> = fs.existsSync(INDEX)
    ? JSON.parse(fs.readFileSync(INDEX, 'utf8'))
    : {};
  fs.mkdirSync(OUT, { recursive: true });

  const { chromium } = loadPlaywright();
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    ...(session ? { storageState: session } : {}),
  });
  const page = await context.newPage();
  const done = new Set<string>();
  let visited = 0;
  for (const [route, names] of plan.routes) {
    const todo = names.filter((n) => !done.has(n));
    if (!todo.length) continue;
    if (visited++ >= maxRoutes) break;
    const at = `${url}/${fixture.locale}/${route}`;
    try {
      await page.goto(at, { waitUntil: 'networkidle', timeout: 45000 });
      // The cookie modal covers the page: decline it, as a visitor would.
      await page
        .click('[data-testid="reject-cookies-btn"]', { timeout: 1500 })
        .catch(() => undefined);
      await page.waitForTimeout(800);
      const files = todo.map((n) => byName.get(n)!.file);
      const found: ReturnType<typeof findInPage> = await page.evaluate(
        // tsx names functions with a helper the page lacks.
        `(() => { const __name = (f) => f; return (${findInPage})(${JSON.stringify(
          files
        )}); })()`
      );
      for (const name of todo) {
        const box = found[byName.get(name)!.file]?.[0];
        if (!box) continue;
        const clip = {
          x: Math.max(0, box.x - PAD),
          y: Math.max(0, box.y - PAD),
          width: Math.min(MAX.width, box.w + PAD * 2),
          height: Math.min(MAX.height, box.h + PAD * 2),
        };
        await page.screenshot({
          path: path.join(OUT, `${cropSlug(name)}.png`),
          clip,
          fullPage: true,
        });
        crops[name] = {
          file: byName.get(name)!.file,
          route,
          width: Math.round(clip.width),
          height: Math.round(clip.height),
        };
        done.add(name);
        console.log(`  ${name}  ${route || '/'}`);
      }
    } catch (e) {
      console.warn(`  ${route || '/'}: ${(e as Error).message.split('\n')[0]}`);
    }
  }
  await browser.close();

  const sorted = Object.fromEntries(
    Object.entries(crops).sort(([a], [b]) => a.localeCompare(b))
  );
  fs.writeFileSync(INDEX, `${JSON.stringify(sorted, null, 2)}\n`);
  const missed = [...plan.routes.values()]
    .flat()
    .filter((n, i, all) => all.indexOf(n) === i && !done.has(n) && !crops[n]);
  console.log(
    `${done.size} pictured, ${missed.length} not found on their routes, ${
      plan.unreachable.length
    } only in the admin${
      session ? ' or on routes with ids' : ' (pass --session)'
    }.`
  );
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
