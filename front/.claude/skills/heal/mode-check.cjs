#!/usr/bin/env node
// Mode safety check for one heal (SPEC 7.5). Run from front/ after `npm run ds:scan`:
//
//   node .claude/skills/heal/mode-check.cjs --file <app/...> --token <--gv-...> \
//     --now <value the code renders today> [--mode today|redesign|both]
//
// `--now` is the resolved value: the literal itself, or the current value of
// the legacy key it reads (look the key up in its source, for example
// app/component-library/utils/styleUtils.ts). A legacy key listed on a token
// is not proof that the values match.
//
// Exit 0: the heal is mode safe. Exit 3: stop, the heal would change a
// rendering it must not change. Exit 2: bad input or missing scan.
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const args = {};
const argv = process.argv.slice(2);
for (let i = 0; i < argv.length; i += 2) {
  if (!argv[i].startsWith('--') || argv[i + 1] === undefined) {
    console.error(`Bad argument: ${argv[i]}`);
    process.exit(2);
  }
  args[argv[i].slice(2)] = argv[i + 1];
}
const { file, token, now } = args;
const mode = args.mode || 'both';
if (!file || !token || now === undefined) {
  console.error(
    'Usage: --file <path> --token <name> --now <value> [--mode today|redesign|both]'
  );
  process.exit(2);
}
if (!['today', 'redesign', 'both'].includes(mode)) {
  console.error(`Unknown mode: ${mode}`);
  process.exit(2);
}

const read = (p) => {
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch (e) {
    console.error(
      `Cannot read ${p}: ${e.message}. Run npm run ds:scan (or ds:tokens) first.`
    );
    process.exit(2);
  }
};
const scan = read(args.scan || '.storybook/static/design-scan.json');
const meta = read(args.meta || 'app/design-system/tokens/tokens.meta.json');

const stop = (why) => {
  console.log(`STOP: ${why}`);
  process.exit(3);
};

const t = meta.find((m) => m.name === token);
if (!t) stop(`${token} is not a token in tokens.meta.json`);

// Directories rendered inside <ModeScope> (data-gv-mode="redesign").
let scopes = [];
try {
  scopes = execFileSync('git', ['grep', '-l', '<ModeScope', '--', 'app'], {
    encoding: 'utf8',
  })
    .split('\n')
    .filter((f) => f && !f.startsWith('app/design-system/'))
    .map((f) => `${path.dirname(f)}/`);
} catch {
  scopes = [];
}
const inScope = scopes.some((d) => file.startsWith(d));

// Where the file renders: the routes of its component, plus every route whose
// import closure holds the file.
const routes = new Set();
const comp = (scan.components || []).find((c) => c.file === file);
if (comp) comp.routes.forEach((r) => routes.add(r));
for (const [route, files] of Object.entries(scan.routeFiles || {})) {
  if (files.includes(file)) routes.add(route);
}
const isAdmin = (r) => r === 'admin' || r.startsWith('admin/');
const list = [...routes];
const admin = list.some(isAdmin);
const pub = list.some((r) => !isAdmin(r));
const office = admin && pub ? 'shared' : admin ? 'bo' : pub ? 'fo' : 'unknown';

const norm = (v) =>
  String(v)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/\s*([,()])\s*/g, '$1')
    .replace(/^#([0-9a-f])([0-9a-f])([0-9a-f])$/, '#$1$1$2$2$3$3')
    .replace(/^0(px|rem|em)$/, '0');

console.log(`file: ${file}${comp ? ` (component ${comp.component})` : ''}`);
console.log(
  `office: ${office}, ${list.length} routes${
    office === 'unknown' ? ' (no route found: treated as shared)' : ''
  }`
);
console.log(
  `redesign scope: ${inScope ? 'inside' : 'outside'}${
    scopes.length ? '' : ' (no ModeScope found)'
  }`
);
console.log(
  `token: ${t.name}, tier ${t.tier}, today ${t.values.today}, redesign ${t.values.redesign}`
);
console.log(`now: ${now}, task mode ${mode}`);

if (inScope) {
  // Only the redesign values render here.
  if (norm(t.values.redesign) === norm(now)) {
    console.log('OK: the redesigned page renders the same value.');
    process.exit(0);
  }
  if (mode !== 'redesign') {
    stop(
      `the redesigned page would change from ${now} to ${t.values.redesign}; only a task with mode redesign may change it`
    );
  }
  console.log(
    `OK, visible change: the redesigned page changes from ${now} to ${t.values.redesign}. Name it in the report.`
  );
  process.exit(0);
}

// Outside the scope every page renders the today values.
if (norm(t.values.today) !== norm(now)) {
  const where =
    office === 'bo'
      ? 'back office pages outside the redesign scope'
      : office === 'fo'
      ? 'front office pages (residents)'
      : 'pages in both offices outside the redesign scope, residents included';
  stop(
    `${t.name} is ${t.values.today} today but the code renders ${now}; the heal would change ${where}. Pick a token whose today value is ${now}, or change the look in a token commit`
  );
}
if (mode === 'redesign' && office !== 'bo') {
  console.log(
    `note: the task says mode redesign but the file reaches ${office} routes; checked against today as well.`
  );
}
console.log(
  `OK: today renders the same value; inside the redesign scope it becomes ${t.values.redesign}.`
);
process.exit(0);
