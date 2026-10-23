/**
 * Mode safety check for one heal (SPEC 7.5), run by the heal and lift skills
 * after `npm run ds:scan`:
 *
 *   npm run ds:mode-check -- --file <app/...> --token <--gv-...> \
 *     --now <value the code renders today> [--mode today|redesign|both]
 *
 * `--now` is the resolved value: the literal, or the current value of the
 * legacy key it reads. Give colours as hex or rgb(), lengths with their unit.
 *
 * Exit 0: mode safe. Exit 3: stop, the heal would change a rendering it must
 * not change. Exit 2: bad input or no scan.
 */
import fs from 'fs';
import path from 'path';

import { redesignScope } from './mode-scope';
import { SourceTree } from './scan/routes';

const ROOT = path.resolve(__dirname, '..', '..');
const MODES = ['today', 'redesign', 'both'];
const FLAGS = ['file', 'token', 'now', 'mode', 'scan', 'meta'];

export type CheckInput = {
  file: string;
  token: { name: string; values: { today: string; redesign: string } };
  now: string;
  mode: string;
  routes: string[];
  inScope: boolean;
};

export type CheckResult = { ok: boolean; lines: string[] };

const hex2 = (n: number) => Math.round(n).toString(16).padStart(2, '0');

/** Comparable form: lower case, hex colours, `0` for zero lengths, bare numbers as px. */
export const normValue = (v: string): string => {
  let s = String(v).trim().toLowerCase().replace(/\s+/g, ' ');
  s = s.replace(/\s*([,()/])\s*/g, '$1');
  const rgb = s.match(
    /^rgba?\((\d+(?:\.\d+)?),(\d+(?:\.\d+)?),(\d+(?:\.\d+)?)(?:[,/](\d*\.?\d+)(%?))?\)$/
  );
  if (rgb) {
    const alpha =
      rgb[4] === undefined ? 1 : Number(rgb[4]) / (rgb[5] ? 100 : 1);
    s = `#${hex2(+rgb[1])}${hex2(+rgb[2])}${hex2(+rgb[3])}${
      alpha === 1 ? '' : hex2(alpha * 255)
    }`;
  }
  s = s.replace(
    /^#([0-9a-f])([0-9a-f])([0-9a-f])([0-9a-f])?$/,
    (_m, r, g, b, a) => `#${r}${r}${g}${g}${b}${b}${a ? a + a : ''}`
  );
  s = s.replace(/^(#[0-9a-f]{6})ff$/, '$1');
  if (/^-?\d*\.?\d+$/.test(s)) s = s === '0' ? '0' : `${s}px`;
  return s.replace(/^-?0(px|rem|em|%)$/, '0');
};

export const officeOf = (routes: string[]) => {
  const isAdmin = (r: string) => r === 'admin' || r.startsWith('admin/');
  const admin = routes.some(isAdmin);
  const pub = routes.some((r) => !isAdmin(r));
  return admin && pub ? 'shared' : admin ? 'bo' : pub ? 'fo' : 'unknown';
};

export const checkMode = (c: CheckInput): CheckResult => {
  const { token: t } = c;
  const office = officeOf(c.routes);
  const lines = [
    `file: ${c.file}`,
    `office: ${office}, ${c.routes.length} routes${
      office === 'unknown' ? ' (no route found: treated as shared)' : ''
    }`,
    `redesign scope: ${
      c.inScope ? 'inside (renders only under ModeScope)' : 'outside'
    }`,
    `token: ${t.name}, today ${t.values.today}, redesign ${t.values.redesign}`,
    `now: ${c.now}, task mode ${c.mode}`,
  ];
  const same = (a: string) => normValue(a) === normValue(c.now);
  if (c.inScope) {
    if (same(t.values.redesign)) {
      lines.push('OK: the redesigned page renders the same value.');
      return { ok: true, lines };
    }
    if (c.mode !== 'redesign') {
      lines.push(
        `STOP: the redesigned page would change from ${c.now} to ${t.values.redesign}; only a task with mode redesign may change it`
      );
      return { ok: false, lines };
    }
    lines.push(
      `OK, visible change: the redesigned page changes from ${c.now} to ${t.values.redesign}. Name it in the report.`
    );
    return { ok: true, lines };
  }
  if (!same(t.values.today)) {
    const where =
      office === 'bo'
        ? 'back office pages outside the redesign scope'
        : office === 'fo'
        ? 'front office pages (residents)'
        : 'pages in both offices outside the redesign scope, residents included';
    lines.push(
      `STOP: ${t.name} is ${t.values.today} today but the code renders ${c.now}; the heal would change ${where}. Use a token whose today value is ${c.now}, or change the look in a token commit`
    );
    return { ok: false, lines };
  }
  if (c.mode === 'redesign' && office !== 'bo') {
    lines.push(
      `note: the task says mode redesign but the file reaches ${office} routes; checked against today as well.`
    );
  }
  lines.push(
    `OK: today renders the same value; where it renders under ModeScope it shows ${t.values.redesign}.`
  );
  return { ok: true, lines };
};

export const parseArgs = (argv: string[]): Record<string, string> => {
  const out: Record<string, string> = {};
  for (let i = 0; i < argv.length; i += 2) {
    const key = argv[i].replace(/^--/, '');
    if (!argv[i].startsWith('--') || !FLAGS.includes(key)) {
      throw new Error(`Unknown argument: ${argv[i]}`);
    }
    if (argv[i + 1] === undefined)
      throw new Error(`Missing value for ${argv[i]}`);
    out[key] = argv[i + 1];
  }
  for (const k of ['file', 'token', 'now']) {
    if (out[k] === undefined) throw new Error(`Missing --${k}`);
  }
  out.mode = out.mode ?? 'both';
  if (!MODES.includes(out.mode)) throw new Error(`Unknown mode: ${out.mode}`);
  return out;
};

const readJson = (p: string) => JSON.parse(fs.readFileSync(p, 'utf8'));

const main = () => {
  let args: Record<string, string>;
  let scan: any;
  let meta: any[];
  try {
    args = parseArgs(process.argv.slice(2));
    scan = readJson(
      path.resolve(ROOT, args.scan ?? '.storybook/static/design-scan.json')
    );
    meta = readJson(
      path.resolve(
        ROOT,
        args.meta ?? 'app/design-system/tokens/tokens.meta.json'
      )
    );
  } catch (e) {
    console.error(`${(e as Error).message}`);
    console.error(
      'Usage: npm run ds:mode-check -- --file <path> --token <name> --now <value> [--mode today|redesign|both]. Run npm run ds:scan first.'
    );
    process.exit(2);
  }
  const file = args.file.replace(/^front\//, '');
  const token = meta.find((m) => m.name === args.token);
  if (!token) {
    console.log(`STOP: ${args.token} is not a token in tokens.meta.json`);
    process.exit(3);
  }
  const tree = new SourceTree(ROOT);
  if (!tree.files.includes(file)) {
    console.error(`No such file under app/: ${file}`);
    process.exit(2);
  }
  const scope = redesignScope({
    files: tree.files,
    source: (f) => tree.source(f),
    imports: (f) => tree.importsOf(f),
    resolve: (from, spec) => tree.resolver.resolve(from, spec),
  });
  const routes = new Set<string>();
  const comp = (scan.components ?? []).find((c: any) => c.file === file);
  comp?.routes.forEach((r: string) => routes.add(r));
  Object.entries(scan.routeFiles ?? {}).forEach(([r, files]) => {
    if ((files as string[]).includes(file)) routes.add(r);
  });
  const result = checkMode({
    file: comp ? `${file} (component ${comp.component})` : file,
    token,
    now: args.now,
    mode: args.mode,
    routes: [...routes],
    inScope: scope.has(file),
  });
  result.lines.forEach((l) => console.log(l));
  process.exit(result.ok ? 0 : 3);
};

if (require.main === module) main();
