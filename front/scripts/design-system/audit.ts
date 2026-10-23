/**
 * Instance audit: one component across the platform.
 *
 *   npm run ds:audit -- --component <Name> --host <url> [--state <file>]
 *     [--storybook <url>]     Storybook to read the Default story from
 *                             (default <host>/storybook)
 *     [--route <text>]        only routes whose path contains <text>
 *                             (repeatable)
 *     [--open <selector>]     a trigger that opens a state, never an action
 *                             button: clicked before looking for instances,
 *                             for components that render inside a menu or
 *                             another closed state (repeatable)
 *     [--max-triggers <n>]    menus to try opening when a page shows no
 *                             instance (default 12)
 *
 * Reads the component's routes from .storybook/static/design-scan.json,
 * fills their params from routes.fixture.json, opens each route with
 * Playwright in a stored admin session at 1280 and 390, and for every
 * visible `[data-gv-component="<Name>"]` records a screenshot, its box size,
 * radius, padding, colours and font size, and the tokens it reads
 * (readComputedTokens from the workbench, injected into the page). When a
 * page shows no instance, it opens up to --max-triggers menus one at a time
 * and looks again (isSafeTrigger: main content only, a menu or listbox
 * popup or an aria-expanded button, never a submit, never a deny-listed
 * name), and stops clicking on the first error or navigation.
 *
 * The run is read-only at the network layer: every request that is not
 * GET, HEAD or OPTIONS is aborted and logged (method and path only),
 * WebSockets and service workers are blocked, and the report records
 * blockedWrites. --host has no default, so a bare run reaches nothing.
 *
 * It compares the
 * instances with each other and with the component's Default story, and
 * writes .storybook/static/audits/<Name>.json, the screenshots under
 * audits/<Name>/ and the index the workbench reads, audits/index.json.
 *
 * The session is a Playwright storage state file outside the repo (default
 * $GV_AUDIT_STATE, else ~/.govocal/epic-admin.json). A person creates it
 * once; when it is missing the script prints the command and exits 2. The
 * file is only ever handed to Playwright, never read or printed here.
 *
 * Playwright is loaded through ./playwright (see there for GV_PLAYWRIGHT_DIR).
 */
/* eslint-disable no-console -- a CLI: progress and results go to the terminal */
import fs from 'fs';
import os from 'os';
import path from 'path';

import {
  normaliseFixture,
  resolveRoute,
  RouteFixture,
  routeLabel,
  routesFor,
  unfilledParams,
} from '../../.storybook/workbench/src/lib/review';

import type { ScanOutput, TokenMeta } from './scan/schema';

// ------------------------------------------------------------------ types

export type Styles = {
  radius: string;
  padding: string;
  color: string;
  background: string;
  fontSize: string;
};

export type TokenUse = { linked: string[]; equal: string[] };

export type AuditInstance = {
  route: string;
  office: 'admin' | 'public';
  url: string;
  viewport: string;
  width: number;
  // Position among the instances found on this route at this viewport.
  index: number;
  count: number;
  // Relative to .storybook/static, so the workbench reads `../<shot>`.
  shot: string;
  box: { width: number; height: number };
  size: string;
  styles: Styles;
  tokens: TokenUse;
  diffsFromStory: string[];
  // The menu button clicked to show it, when it was hidden.
  openedBy?: string;
  error?: string;
};

export type StoryCapture = {
  id: string;
  mode: 'today' | 'redesign';
  viewport: string;
  width: number;
  // `tag`: the story's [data-gv-component] element; `storybook-root`: the
  // Storybook build has no tags, so only tokens are compared.
  root: 'tag' | 'storybook-root';
  shot: string;
  styles: Styles;
  tokens: TokenUse;
  error?: string;
};

export type NotReached = { route: string; reason: string };

export type AuditReport = {
  component: string;
  generatedAt: string;
  host: string;
  // Non-read requests and WebSockets the network guard stopped.
  blockedWrites?: number;
  blocked?: string[];
  storybook?: string;
  story?: string;
  stories?: StoryCapture[];
  instances: AuditInstance[];
  notReached: NotReached[];
  inconsistencies: string[];
  healTasks: string[];
};

export type AuditIndex = {
  generatedAt: string;
  components: Record<string, Record<string, unknown>>;
};

// ------------------------------------------------------------------ args

export type AuditArgs = {
  component: string;
  host: string;
  storybook: string;
  state: string;
  open: string[];
  routes: string[];
  maxTriggers: number;
};

const trimSlash = (s: string) => s.replace(/\/+$/, '');

export const parseArgs = (
  argv: string[],
  defaults: { defaultState: string }
): AuditArgs => {
  let component = '';
  let host = '';
  let storybook = '';
  let state = defaults.defaultState;
  const open: string[] = [];
  const routes: string[] = [];
  let maxTriggers = 12;
  for (let i = 0; i < argv.length; i++) {
    const flag = argv[i];
    const value = () => {
      const v = argv.at(++i);
      if (v === undefined) throw new Error(`${flag} needs a value`);
      return v;
    };
    if (flag === '--component') component = value();
    else if (flag === '--host') host = value();
    else if (flag === '--storybook') storybook = value();
    else if (flag === '--state') state = value();
    else if (flag === '--open') open.push(value());
    else if (flag === '--route') routes.push(value());
    else if (flag === '--max-triggers') maxTriggers = Number(value()) || 0;
    else throw new Error(`unknown argument ${flag}`);
  }
  if (!component) throw new Error('--component <Name> is required');
  // No default host: a bare run must never reach a remote platform.
  if (!host) throw new Error('--host <platform url> is required');
  host = trimSlash(host);
  return {
    component,
    host,
    storybook: trimSlash(storybook || `${host}/storybook`),
    state,
    open,
    routes,
    maxTriggers,
  };
};

export const codegenCommand = (statePath: string, host: string) =>
  `npx playwright codegen --save-storage=${statePath} ${trimSlash(
    host
  )}/en/sign-in`;

// ---------------------------------------------------------------- safety

// Requests the run lets through. Every other method is aborted at the
// network layer, so no click, menu close or page script can write.
export const READ_METHODS = ['GET', 'HEAD', 'OPTIONS'];
export const isReadRequest = (method: string) =>
  READ_METHODS.includes(method.toUpperCase());

// A blocked request as logged: method and path, never the query or body.
export const blockedLine = (method: string, url: string) => {
  try {
    return `${method.toUpperCase()} ${new URL(url).pathname}`;
  } catch {
    return `${method.toUpperCase()} (unparsable url)`;
  }
};

// What the page says about a candidate menu trigger.
export type TriggerInfo = {
  tag: string;
  // The type attribute as written ('' when absent).
  typeAttr: string;
  // Whether a form owns the element.
  inForm: boolean;
  // Inside header, nav, [role=banner] or [role=navigation].
  inChrome: boolean;
  // Whether the page has a main landmark, and the element is inside it.
  hasMain: boolean;
  inMain: boolean;
  ariaHasPopup: string | null;
  ariaExpanded: string | null;
  // Accessible name (aria-label, else text).
  name: string;
};

// Names of buttons the run never clicks, in English, Dutch, French,
// German and Spanish.
export const DENIED_NAMES = new RegExp(
  [
    'delete',
    'remove',
    'archive',
    'publish',
    'sign ?out',
    'log ?out',
    'notification',
    'verwijder',
    'publice',
    'afmelden',
    'uitloggen',
    'melding',
    'supprimer',
    'retirer',
    'archiver',
    'publier',
    'd[ée]connex',
    'd[ée]connect',
    'l[öo]schen',
    'entfernen',
    'archivieren',
    'ver[öo]ffentlichen',
    'abmelden',
    'benachrichtigung',
    'eliminar',
    'borrar',
    'quitar',
    'archivar',
    'publicar',
    'cerrar sesi[óo]n',
    'notificaci[óo]n',
  ].join('|'),
  'i'
);

const POPUP_VALUES = ['menu', 'listbox', 'true'];

// Whether the audit may click this element to show a hidden instance:
// in the page's main content, a menu or listbox popup trigger (or an
// aria-expanded button), never a submit or a form-owned button without
// type="button", never a name on the deny list.
export const isSafeTrigger = (t: TriggerInfo): boolean => {
  if (t.inChrome) return false;
  if (t.hasMain && !t.inMain) return false;
  if (DENIED_NAMES.test(t.name)) return false;
  const type = t.typeAttr.toLowerCase();
  if (type === 'submit') return false;
  if (t.inForm && type !== 'button') return false;
  const popup = (t.ariaHasPopup ?? '').toLowerCase();
  if (POPUP_VALUES.includes(popup)) return true;
  return t.tag === 'button' && t.ariaExpanded !== null;
};

// Puts the read-only guard on a Playwright browser context: requests
// other than GET, HEAD and OPTIONS are aborted, WebSockets are closed
// before they connect. Each one is pushed to `blocked` as method and path.
export const guardContext = async (context: any, blocked: string[]) => {
  await context.route('**/*', (route: any) => {
    const req = route.request();
    if (isReadRequest(req.method())) return route.continue();
    blocked.push(blockedLine(req.method(), req.url()));
    return route.abort('blockedbyclient');
  });
  await context.routeWebSocket(/.*/, (ws: any) => {
    blocked.push(blockedLine('WEBSOCKET', ws.url()));
    // Never connectToServer: the socket only ever talks to this handler.
    return ws.close();
  });
};

// Blocked requests that were writes (not WebSockets).
export const blockedWrites = (blocked: string[]) =>
  blocked.filter((b) => !b.startsWith('WEBSOCKET ')).length;

// Whether `file` is `dir` or inside it.
export const isInside = (dir: string, file: string) => {
  const rel = path.relative(path.resolve(dir), path.resolve(file));
  return rel === '' || (!rel.startsWith('..') && !path.isAbsolute(rel));
};

// ---------------------------------------------------------------- routes

export type Visit = { route: string; office: 'admin' | 'public'; url: string };

// The component's routes as URLs on `host`; routes with a param the
// fixture lacks are listed, not dropped silently.
export const planVisits = (
  scan: ScanOutput,
  component: string,
  fixture: RouteFixture,
  host: string,
  only: string[] = []
): { visits: Visit[]; notReached: NotReached[] } => {
  const visits: Visit[] = [];
  const notReached: NotReached[] = [];
  const refs = routesFor(scan, { component }).filter(
    (r) => !only.length || only.some((o) => `/${r.path}`.includes(o))
  );
  for (const r of refs) {
    const unfilled = unfilledParams(r.path, fixture);
    if (unfilled.length) {
      notReached.push({
        route: r.path,
        reason: `no fixture value for ${unfilled.join(', ')}`,
      });
      continue;
    }
    visits.push({
      route: r.path,
      office: r.office,
      url: resolveRoute(r.path, fixture, host),
    });
  }
  return { visits, notReached };
};

type IndexEntry = {
  id: string;
  title: string;
  name: string;
  type?: string;
  importPath?: string;
};

// The component's Default story (by title, then by its folder), else its
// first story.
export const findStory = (
  index: { entries?: Record<string, IndexEntry> },
  component: string
): string | undefined => {
  const stories = Object.values(index.entries ?? {}).filter(
    (e) => (e.type ?? 'story') === 'story'
  );
  const byTitle = stories.filter((e) => e.title.split('/').pop() === component);
  const mine = byTitle.length
    ? byTitle
    : stories.filter((e) =>
        (e.importPath ?? '').includes(`/components/${component}/`)
      );
  const pick = mine.find((e) => e.name === 'Default') ?? mine.at(0);
  return pick?.id;
};

// --------------------------------------------------------------- compare

const SIZE_STEPS: [number, string][] = [
  [32, 'xs'],
  [96, 's'],
  [240, 'm'],
  [480, 'l'],
];

const bucket = (px: number) =>
  SIZE_STEPS.find(([max]) => px < max)?.[1] ?? 'xl';

// A coarse size per side, so a list two rows longer is not a difference
// but a field twice as wide is.
export const sizeClass = (width: number, height: number) =>
  `w:${bucket(width)} h:${bucket(height)}`;

// [top, right, bottom, left] as the shortest CSS shorthand.
export const shorthand = ([t, r, b, l]: string[]) => {
  if (r === l) {
    if (t === b) return t === r ? t : `${t} ${r}`;
    return `${t} ${r} ${b}`;
  }
  return `${t} ${r} ${b} ${l}`;
};

const STYLE_FIELDS: (keyof Styles)[] = [
  'radius',
  'padding',
  'color',
  'background',
  'fontSize',
];

const FIELD_LABEL: Record<keyof Styles, string> = {
  radius: 'radius',
  padding: 'padding',
  color: 'colour',
  background: 'background',
  fontSize: 'font size',
};

export const instanceLabel = (i: AuditInstance) =>
  `${routeLabel(i.route)}${i.count > 1 ? ` #${i.index + 1}` : ''} (${i.width})`;

const used = (t: TokenUse) => new Set([...t.linked, ...t.equal]);

// A token list for one line: values match many tokens at once (a 4px
// radius is several scale steps), so long lists are cut.
const NAMES_MAX = 6;
const names = (list: string[]) =>
  list.length > NAMES_MAX
    ? `${list.slice(0, NAMES_MAX).join(', ')} and ${
        list.length - NAMES_MAX
      } more`
    : list.join(', ');

// What differs between two instances at the same viewport: size class,
// each style field, tokens one reads and the other does not, and tokens
// one reads through var() while the other only matches the value.
export const compareInstances = (
  a: AuditInstance,
  b: AuditInstance
): string[] => {
  if (a.error || b.error || a.viewport !== b.viewport) return [];
  const A = instanceLabel(a);
  const B = instanceLabel(b);
  const lines: string[] = [];
  if (a.size !== b.size) {
    lines.push(`size: ${a.size} on ${A} vs ${b.size} on ${B}`);
  }
  for (const f of STYLE_FIELDS) {
    if (a.styles[f] !== b.styles[f]) {
      lines.push(
        `${FIELD_LABEL[f]}: ${a.styles[f]} on ${A} vs ${b.styles[f]} on ${B}`
      );
    }
  }
  const ua = used(a.tokens);
  const ub = used(b.tokens);
  const onlyA = [...ua].filter((n) => !ub.has(n));
  const onlyB = [...ub].filter((n) => !ua.has(n));
  if (onlyA.length) lines.push(`tokens: ${names(onlyA)} only on ${A}`);
  if (onlyB.length) lines.push(`tokens: ${names(onlyB)} only on ${B}`);
  const la = new Set(a.tokens.linked);
  const lb = new Set(b.tokens.linked);
  for (const [x, X, y, Y] of [
    [la, A, lb, B],
    [lb, B, la, A],
  ] as const) {
    const loose = [...x].filter((n) => !y.has(n) && (X === A ? ub : ua).has(n));
    if (loose.length) {
      lines.push(
        `tokens: ${names(
          loose
        )} read through var() on ${X}, value only matches on ${Y}`
      );
    }
  }
  return lines;
};

// What differs from the story. Style fields only when the story root is
// the component's tagged element; tokens always.
export const compareWithStory = (
  i: AuditInstance,
  story: StoryCapture | undefined
): string[] => {
  if (i.error) return [];
  if (!story || story.error) return ['no Default story captured'];
  const lines: string[] = [];
  if (story.root === 'tag') {
    for (const f of STYLE_FIELDS) {
      if (i.styles[f] !== story.styles[f]) {
        lines.push(
          `${FIELD_LABEL[f]}: ${i.styles[f]}, story ${story.id} ${story.styles[f]}`
        );
      }
    }
  }
  const mine = used(i.tokens);
  const theirs = used(story.tokens);
  const missingHere = [...theirs].filter((n) => !mine.has(n));
  const extra = [...mine].filter((n) => !theirs.has(n));
  if (missingHere.length) {
    lines.push(`tokens: ${names(missingHere)} in the story, not here`);
  }
  if (extra.length) {
    lines.push(`tokens: ${names(extra)} here, not in the story`);
  }
  return lines;
};

// Every pairwise difference once.
export const inconsistencies = (instances: AuditInstance[]): string[] => {
  const out = new Set<string>();
  for (let i = 0; i < instances.length; i++) {
    for (let j = i + 1; j < instances.length; j++) {
      compareInstances(instances[i], instances[j]).forEach((l) => out.add(l));
    }
  }
  return [...out];
};

export const modeOf = (office: string): 'today' | 'redesign' =>
  office === 'admin' ? 'redesign' : 'today';

// The story capture an instance is compared with: same mode and
// viewport, or none (sizes and spacing differ between viewports).
export const storyFor = (
  i: AuditInstance,
  stories: StoryCapture[]
): StoryCapture | undefined =>
  stories.find(
    (s) => !s.error && s.mode === modeOf(i.office) && s.viewport === i.viewport
  );

// ------------------------------------------------------------ heal tasks

const FIELD_CATEGORY: Record<keyof Styles, (t: TokenMeta) => boolean> = {
  radius: (t) => t.category === 'radius',
  padding: (t) => t.category === 'space',
  color: (t) => t.category === 'color',
  background: (t) => t.category === 'color',
  fontSize: (t) =>
    (t.category === 'font' || t.category === 'text') &&
    /(^--gv-fs-|-size$)/.test(t.name),
};

// Token values as getComputedStyle writes them: hex colours as rgb().
export const computedForm = (value: string): string => {
  const hex = /^#([0-9a-f]{3,8})$/i.exec(value.trim());
  if (!hex) return value.trim();
  let h = hex[1];
  if (h.length === 3 || h.length === 4) {
    h = h
      .split('')
      .map((c) => c + c)
      .join('');
  }
  const n = (k: number) => parseInt(h.slice(k, k + 2), 16);
  if (h.length === 8 && n(6) !== 255) {
    const a = Math.round((n(6) / 255) * 1000) / 1000;
    return `rgba(${n(0)}, ${n(2)}, ${n(4)}, ${a})`;
  }
  return `rgb(${n(0)}, ${n(2)}, ${n(4)})`;
};

// Tokens whose value in `mode` is `value`: the ones the story reads first;
// else Tier 2 before Tier 1.
const tokensFor = (
  field: keyof Styles,
  value: string,
  mode: 'today' | 'redesign',
  meta: TokenMeta[],
  storyLinked: string[]
): string[] => {
  const hits = meta.filter(
    (t) => FIELD_CATEGORY[field](t) && computedForm(t.values[mode]) === value
  );
  const linked = hits.filter((t) => storyLinked.includes(t.name));
  const pick = linked.length ? linked : hits.sort((x, y) => y.tier - x.tier);
  return pick.map((t) => t.name);
};

// The call sites on these routes: the component's usages (not the library
// barrel) in the files each route reaches.
const sitesOn = (scan: ScanOutput, component: string, routes: string[]) => {
  const files = new Set(routes.flatMap((r) => scan.routeFiles?.[r] ?? []));
  const sites = scan.usages
    .filter(
      (u) =>
        u.component === component &&
        files.has(u.file) &&
        u.file !== 'app/component-library/index.tsx'
    )
    .map((u) => `${u.file}:${u.line}`);
  if (sites.length) return [...new Set(sites)];
  const own = scan.components.find((c) => c.component === component)?.file;
  return own ? [own] : ['(call site unknown)'];
};

const mostCommon = (values: string[]): string | undefined => {
  const counts = new Map<string, number>();
  values.forEach((v) => counts.set(v, (counts.get(v) ?? 0) + 1));
  const sorted = [...counts].sort((a, b) => b[1] - a[1]);
  if (!sorted.length || (sorted[1] && sorted[1][1] === sorted[0][1])) {
    return undefined;
  }
  return sorted[0][1] > 1 ? sorted[0][0] : undefined;
};

type Divergence = {
  field: keyof Styles;
  value: string;
  reference: string;
  storyId?: string;
  storyLinked: string[];
  mode: 'today' | 'redesign';
  instances: AuditInstance[];
};

// One heal task per divergence: a style value that differs from the
// Default story (or, without a tagged story, from the most common value
// across instances at that viewport), grouped over routes and viewports.
export const healTasks = (
  component: string,
  instances: AuditInstance[],
  stories: StoryCapture[],
  scan: ScanOutput,
  meta: TokenMeta[]
): string[] => {
  const groups = new Map<string, Divergence>();
  const ok = instances.filter((i) => !i.error);
  for (const i of ok) {
    const story = storyFor(i, stories);
    const tagged = story && story.root === 'tag' ? story : undefined;
    for (const field of STYLE_FIELDS) {
      const reference = tagged
        ? tagged.styles[field]
        : mostCommon(
            ok
              .filter((o) => o.viewport === i.viewport)
              .map((o) => o.styles[field])
          );
      if (reference === undefined || i.styles[field] === reference) continue;
      const mode = modeOf(i.office);
      const key = [
        field,
        i.styles[field],
        reference,
        tagged?.id ?? '',
        mode,
      ].join('|');
      if (!groups.has(key)) {
        groups.set(key, {
          field,
          value: i.styles[field],
          reference,
          storyId: tagged?.id,
          storyLinked: tagged?.tokens.linked ?? [],
          mode,
          instances: [],
        });
      }
      groups.get(key)?.instances.push(i);
    }
  }
  return [...groups.values()].map((d) => {
    const routes = [...new Set(d.instances.map((i) => i.route))];
    const where = routes
      .map((r) => {
        const widths = [
          ...new Set(
            d.instances.filter((i) => i.route === r).map((i) => i.width)
          ),
        ];
        return `${routeLabel(r)} (${widths.join(', ')})`;
      })
      .join(', ');
    const tokens = tokensFor(d.field, d.reference, d.mode, meta, d.storyLinked);
    const to = tokens.length ? tokens.join(' or ') : '(choose a token)';
    const against = d.storyId
      ? `story ${d.storyId} ${d.reference}`
      : `most instances ${d.reference}`;
    return [
      `heal: ${component} · ${sitesOn(scan, component, routes).join(
        ' or '
      )} · ${d.value} → ${to} · mode ${d.mode}`,
      `why: audit, ${FIELD_LABEL[d.field]} ${d.value} on ${where}, ${against}`,
      `check: story ${d.storyId ?? '(none)'}, routes ${routes
        .map(routeLabel)
        .join(', ')}`,
    ].join('\n');
  });
};

// ----------------------------------------------------------------- index

export const auditIndex = (
  existing: Partial<AuditIndex> | undefined,
  report: Pick<
    AuditReport,
    | 'component'
    | 'generatedAt'
    | 'host'
    | 'instances'
    | 'notReached'
    | 'inconsistencies'
    | 'healTasks'
    | 'blockedWrites'
  >
): AuditIndex => {
  const ok = report.instances.filter((i) => !i.error);
  return {
    generatedAt: report.generatedAt,
    components: {
      ...(existing?.components ?? {}),
      [report.component]: {
        file: `audits/${report.component}.json`,
        generatedAt: report.generatedAt,
        host: report.host,
        instances: ok.length,
        failed: report.instances.length - ok.length,
        routes: new Set(ok.map((i) => i.route)).size,
        notReached: report.notReached.length,
        inconsistencies: report.inconsistencies.length,
        healTasks: report.healTasks.length,
        blockedWrites: report.blockedWrites ?? 0,
      },
    },
  };
};

// ------------------------------------------------------------- the run

const ROOT = path.resolve(__dirname, '..', '..');
const STATIC = path.join(ROOT, '.storybook', 'static');
const WORKBENCH_LIB = path.join(ROOT, '.storybook', 'workbench', 'src', 'lib');
const VIEWPORTS = [
  { name: 'desktop', width: 1280, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
];
const SETTLED_PHASES = ['finished', 'errored', 'aborted'];
const NO_ANIMATION_CSS =
  '*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}';
// Candidates only; isSafeTrigger decides which are clicked.
const TRIGGERS =
  'button[aria-haspopup], button[aria-expanded="false"], [role="button"][aria-haspopup]';
const SEEN = 'data-gv-audit-seen';

const readJson = (file: string): any => {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return undefined;
  }
};

const slug = (route: string) =>
  route
    .replace(/\$/g, '')
    .replace(/[^A-Za-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'home';

// readComputedTokens, frameState and dismissConsent from the workbench, as
// one script for the page (window.__gvAudit).
const pageScript = async (): Promise<string> => {
  const esbuild = await import('esbuild');
  const out = await esbuild.build({
    stdin: {
      contents: [
        "import { readComputedTokens } from './frame';",
        "import { dismissConsent, frameState } from './review';",
        '(window as any).__gvAudit = { readComputedTokens, dismissConsent, frameState };',
      ].join('\n'),
      resolveDir: WORKBENCH_LIB,
      loader: 'ts',
    },
    bundle: true,
    format: 'iife',
    platform: 'browser',
    target: 'es2020',
    write: false,
    logLevel: 'silent',
    define: { 'process.env.NODE_ENV': '"production"' },
  });
  // tsx compiles this file with keepNames, which wraps the functions passed
  // to evaluate() in __name(); the page needs it defined.
  return `globalThis.__name = globalThis.__name || ((f) => f);\n${out.outputFiles[0].text}`;
};

type Raw = {
  box: { width: number; height: number } | null;
  radius: string[];
  padding: string[];
  color: string;
  background: string;
  fontSize: string;
  tokens: { name: string; matches: string }[];
};

// Styles and tokens of one element, read inside the page.
const readElement = (handle: any, meta: TokenMeta[]): Promise<Raw> =>
  handle.evaluate((el: Element, m: TokenMeta[]) => {
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    const get = (p: string) => cs.getPropertyValue(p).trim();
    return {
      box: { width: Math.round(r.width), height: Math.round(r.height) },
      radius: ['top-left', 'top-right', 'bottom-right', 'bottom-left'].map(
        (c) => get(`border-${c}-radius`)
      ),
      padding: ['top', 'right', 'bottom', 'left'].map((s) =>
        get(`padding-${s}`)
      ),
      color: get('color'),
      background: get('background-color'),
      fontSize: get('font-size'),
      tokens: (window as any).__gvAudit.readComputedTokens(document, m, el),
    };
  }, meta);

// What isSafeTrigger needs to know about an element, read in the page.
const triggerInfo = (handle: any): Promise<TriggerInfo> =>
  handle.evaluate((el: HTMLElement) => {
    const main = document.querySelector('main, [role="main"]');
    return {
      tag: el.tagName.toLowerCase(),
      typeAttr: el.getAttribute('type') ?? '',
      inForm: Boolean((el as HTMLButtonElement).form ?? el.closest('form')),
      inChrome: Boolean(
        el.closest('header, nav, [role="banner"], [role="navigation"]')
      ),
      hasMain: Boolean(main),
      inMain: Boolean(main?.contains(el)),
      ariaHasPopup: el.getAttribute('aria-haspopup'),
      ariaExpanded: el.getAttribute('aria-expanded'),
      name: (
        el.getAttribute('aria-label') ||
        el.getAttribute('title') ||
        el.innerText ||
        el.textContent ||
        ''
      )
        .trim()
        .replace(/\s+/g, ' ')
        .slice(0, 80),
    };
  });

const toStyles = (raw: Raw): Styles => ({
  radius: shorthand(raw.radius),
  padding: shorthand(raw.padding),
  color: raw.color,
  background: raw.background,
  fontSize: raw.fontSize,
});

const toTokens = (raw: Raw): TokenUse => ({
  linked: raw.tokens.filter((t) => t.matches === 'linked').map((t) => t.name),
  equal: raw.tokens.filter((t) => t.matches === 'equal').map((t) => t.name),
});

const EMPTY_STYLES: Styles = {
  radius: '',
  padding: '',
  color: '',
  background: '',
  fontSize: '',
};

const main = async () => {
  const fixture = normaliseFixture(
    readJson(path.join(STATIC, 'routes.fixture.json'))
  );
  let args: AuditArgs;
  try {
    args = parseArgs(process.argv.slice(2), {
      defaultState:
        process.env.GV_AUDIT_STATE ||
        path.join(os.homedir(), '.govocal', 'epic-admin.json'),
    });
  } catch (e: any) {
    console.error(`ds:audit: ${e.message}`);
    process.exit(2);
  }
  const { component } = args;

  const stateFile = path.resolve(args.state);
  if (!fs.existsSync(stateFile)) {
    console.error(
      [
        `ds:audit: no stored session at ${stateFile}.`,
        'A person creates it once: run the command below, sign in as an admin in the browser it opens, then close the window.',
        '',
        `  ${codegenCommand(stateFile, args.host)}`,
        '',
        'Keep the file outside the repository. Then run ds:audit again (pass --state if you saved it elsewhere).',
      ].join('\n')
    );
    process.exit(2);
  }
  if (isInside(path.resolve(ROOT, '..'), stateFile)) {
    console.warn(
      `ds:audit: warning: the session file ${stateFile} is inside the repository. Move it outside so it can never be committed.`
    );
  }

  const scan: ScanOutput | undefined = readJson(
    path.join(STATIC, 'design-scan.json')
  );
  if (!scan?.components) {
    console.error(
      'ds:audit: no .storybook/static/design-scan.json; run npm run ds:scan first.'
    );
    process.exit(2);
  }
  if (component === 'Box') {
    console.error(
      'ds:audit: Box is never audited; an outer library component tag replaces it.'
    );
    process.exit(2);
  }
  const entry = scan.components.find((c) => c.component === component);
  if (!entry) {
    console.error(`ds:audit: ${component} is not a component in the scan.`);
    process.exit(2);
  }
  if (!entry.file.startsWith('app/component-library/')) {
    console.error(
      `ds:audit: ${component} lives in ${entry.file}; only app/component-library components carry data-gv-component, so it cannot be found on a page.`
    );
    process.exit(2);
  }

  const meta: TokenMeta[] =
    readJson(
      path.join(ROOT, 'app', 'design-system', 'tokens', 'tokens.meta.json')
    ) ?? [];
  const { visits, notReached } = planVisits(
    scan,
    component,
    fixture,
    args.host,
    args.routes
  );
  console.log(
    `ds:audit: ${component} on ${visits.length} routes at ${args.host}${
      notReached.length ? ` (${notReached.length} without fixture values)` : ''
    }`
  );

  const { chromium } = (await import('./playwright')).loadPlaywright();
  const script = await pageScript();
  const outDir = path.join(STATIC, 'audits');
  const shotDir = path.join(outDir, component);
  fs.rmSync(shotDir, { recursive: true, force: true });
  fs.mkdirSync(shotDir, { recursive: true });
  const rel = (file: string) =>
    path.relative(STATIC, file).split(path.sep).join('/');
  const selector = `[data-gv-component="${component}"]`;

  const browser = await chromium.launch({ chromiumSandbox: false });
  const instances: AuditInstance[] = [];
  const stories: StoryCapture[] = [];
  const unreached = new Map<string, string>();
  let storyId: string | undefined;
  const blocked: string[] = [];

  try {
    for (const vp of VIEWPORTS) {
      // The storage state is only ever passed to Playwright.
      const context = await browser.newContext({
        storageState: stateFile,
        viewport: { width: vp.width, height: vp.height },
        deviceScaleFactor: 1,
        reducedMotion: 'reduce',
        // Service worker requests would bypass the guard.
        serviceWorkers: 'block',
      });
      await guardContext(context, blocked);
      await context.addInitScript({ content: script });
      const page = await context.newPage();

      // ---- the story
      if (storyId === undefined) {
        try {
          const res = await context.request.get(
            `${args.storybook}/index.json`,
            {
              timeout: 20000,
            }
          );
          storyId = res.ok()
            ? findStory(await res.json(), component) ?? ''
            : '';
        } catch {
          storyId = '';
        }
        if (!storyId) {
          console.log(
            `  no story for ${component} at ${args.storybook}/index.json`
          );
        }
      }
      const modes = [...new Set(visits.map((v) => modeOf(v.office)))];
      for (const mode of storyId ? modes : []) {
        const id = storyId as string;
        const file = path.join(shotDir, `story-${mode}-${vp.width}.png`);
        try {
          await page.goto(
            `${args.storybook}/iframe.html?id=${encodeURIComponent(
              id
            )}&viewMode=story&globals=mode:${mode}`,
            { waitUntil: 'load', timeout: 45000 }
          );
          await page.addStyleTag({ content: NO_ANIMATION_CSS });
          await page.waitForFunction(
            (phases: string[]) =>
              phases.includes(
                (window as any).__STORYBOOK_PREVIEW__?.currentRender?.phase
              ),
            SETTLED_PHASES,
            { timeout: 20000 }
          );
          await page.waitForTimeout(200);
          const tagged = await page.$(`#storybook-root ${selector}`);
          const handle = tagged ?? (await page.$('#storybook-root'));
          if (!handle) throw new Error('no #storybook-root');
          const raw = await readElement(handle, meta);
          await handle.screenshot({ path: file, animations: 'disabled' });
          stories.push({
            id,
            mode,
            viewport: vp.name,
            width: vp.width,
            root: tagged ? 'tag' : 'storybook-root',
            shot: rel(file),
            styles: toStyles(raw),
            tokens: toTokens(raw),
          });
        } catch (e: any) {
          stories.push({
            id,
            mode,
            viewport: vp.name,
            width: vp.width,
            root: 'storybook-root',
            shot: '',
            styles: EMPTY_STYLES,
            tokens: { linked: [], equal: [] },
            error: String(e?.message ?? e).split('\n')[0],
          });
        }
      }

      // ---- the platform
      for (const v of visits) {
        const found: AuditInstance[] = [];
        const fail = (error: string) =>
          instances.push({
            route: v.route,
            office: v.office,
            url: v.url,
            viewport: vp.name,
            width: vp.width,
            index: 0,
            count: 0,
            shot: '',
            box: { width: 0, height: 0 },
            size: '',
            styles: EMPTY_STYLES,
            tokens: { linked: [], equal: [] },
            diffsFromStory: [],
            error,
          });
        try {
          await page.goto(v.url, { waitUntil: 'load', timeout: 45000 });
          await page
            .waitForLoadState('networkidle', { timeout: 10000 })
            .catch(() => undefined);
          const state = await page.evaluate(
            (p: string) => (window as any).__gvAudit.frameState(document, p),
            v.route
          );
          if (state === 'login') {
            unreached.set(
              v.route,
              'sign-in page or redirect: the session expired or is not an admin'
            );
            fail('login');
            continue;
          }
          if (
            await page.evaluate(() =>
              (window as any).__gvAudit.dismissConsent(document)
            )
          ) {
            await page.waitForTimeout(300);
          }
          await page.addStyleTag({ content: NO_ANIMATION_CSS });
          await page
            .waitForSelector(selector, { state: 'attached', timeout: 8000 })
            .catch(() => undefined);
          if (!(await page.$('[data-gv-component]'))) {
            unreached.set(
              v.route,
              'page has no data-gv-component tags (build without VITE_GV_DESIGN_TAGS=1)'
            );
            fail('untagged build');
            continue;
          }

          const collect = async (openedBy?: string) => {
            for (const handle of await page.$$(`${selector}:not([${SEEN}])`)) {
              if (!(await handle.isVisible())) continue;
              await handle.evaluate(
                (el: Element, a: string) => el.setAttribute(a, ''),
                SEEN
              );
              await handle.scrollIntoViewIfNeeded().catch(() => undefined);
              const raw = await readElement(handle, meta);
              const n = found.length;
              const file = path.join(
                shotDir,
                `${slug(v.route)}-${vp.width}-${n + 1}.png`
              );
              await handle
                .screenshot({
                  path: file,
                  animations: 'disabled',
                  timeout: 15000,
                })
                .catch(() => undefined);
              const box = raw.box ?? { width: 0, height: 0 };
              found.push({
                route: v.route,
                office: v.office,
                url: v.url,
                viewport: vp.name,
                width: vp.width,
                index: n,
                count: 0,
                shot: fs.existsSync(file) ? rel(file) : '',
                box,
                size: sizeClass(box.width, box.height),
                styles: toStyles(raw),
                tokens: toTokens(raw),
                diffsFromStory: [],
                ...(openedBy ? { openedBy } : {}),
              });
            }
          };
          // Clicks one trigger and collects what it opened. False when the
          // click navigated or anything failed: the caller stops clicking.
          let stopped = '';
          const tryOpen = async (h: any, label: string): Promise<boolean> => {
            const before = page.url();
            try {
              await h.click({ timeout: 3000 });
              if (page.url() !== before) throw new Error('navigated');
              await page.waitForTimeout(500);
              if (page.url() !== before) throw new Error('navigated');
              await collect(label);
              await page.keyboard.press('Escape');
              await page.waitForTimeout(200);
              if (page.url() !== before) throw new Error('navigated');
              return true;
            } catch (e: any) {
              stopped = `${label}: ${String(e?.message ?? e).split('\n')[0]}`;
              console.log(
                `  stopped clicking on ${routeLabel(v.route)} (${stopped})`
              );
              return false;
            }
          };

          await collect();
          for (const sel of args.open) {
            const h = await page.$(sel).catch(() => null);
            if (!h || !(await h.isVisible().catch(() => false))) continue;
            const info = await triggerInfo(h);
            if (DENIED_NAMES.test(info.name) || info.inChrome) {
              console.log(
                `  skipped --open ${sel}: "${info.name}" is in the header or on the deny list`
              );
              continue;
            }
            if (!(await tryOpen(h, sel))) break;
          }
          if (!found.length && !stopped && args.maxTriggers > 0) {
            const triggers = (await page.$$(TRIGGERS)).slice(0, 200);
            let tried = 0;
            for (const h of triggers) {
              if (tried >= args.maxTriggers) break;
              if (!(await h.isVisible().catch(() => false))) continue;
              const info = await triggerInfo(h).catch(() => undefined);
              if (!info || !isSafeTrigger(info)) continue;
              tried++;
              if (!(await tryOpen(h, info.name || 'menu'))) break;
            }
          }
          if (!found.length) {
            unreached.set(
              v.route,
              `no visible ${component} (tried ${args.open.length} --open selectors and up to ${args.maxTriggers} menus)`
            );
            fail('not found');
            continue;
          }
          found.forEach((i) => {
            i.count = found.length;
          });
          instances.push(...found);
          console.log(`  ${vp.width} ${routeLabel(v.route)}: ${found.length}`);
        } catch (e: any) {
          fail(String(e?.message ?? e).split('\n')[0]);
        }
      }
      await context.close();
    }
  } finally {
    await browser.close();
  }

  instances.forEach((i) => {
    i.diffsFromStory = compareWithStory(i, storyFor(i, stories));
  });
  // A route reached at one viewport but not the other is a failed
  // instance, not "not reached".
  const reached = new Set(
    instances.filter((i) => !i.error).map((i) => i.route)
  );
  unreached.forEach((reason, route) => {
    if (!reached.has(route)) notReached.push({ route, reason });
  });
  const report: AuditReport = {
    component,
    generatedAt: new Date().toISOString(),
    host: args.host,
    storybook: args.storybook,
    story: storyId || undefined,
    stories,
    instances,
    notReached,
    inconsistencies: inconsistencies(instances),
    healTasks: healTasks(component, instances, stories, scan, meta),
    blockedWrites: blockedWrites(blocked),
    blocked: [...new Set(blocked)],
  };
  fs.writeFileSync(
    path.join(outDir, `${component}.json`),
    `${JSON.stringify(report, null, 2)}\n`
  );
  const indexFile = path.join(outDir, 'index.json');
  fs.writeFileSync(
    indexFile,
    `${JSON.stringify(auditIndex(readJson(indexFile), report), null, 2)}\n`
  );
  const ok = instances.filter((i) => !i.error);
  console.log(
    `ds:audit: ${ok.length} instances on ${
      new Set(ok.map((i) => i.route)).size
    } routes; ${report.inconsistencies.length} inconsistencies; ${
      report.healTasks.length
    } heal tasks; not reached: ${
      notReached.length
    }. Wrote .storybook/static/audits/${component}.json and audits/index.json`
  );
  if (instances.some((i) => i.error === 'login')) {
    console.log(
      `Some pages showed the sign-in page. If the session expired, create it again:\n  ${codegenCommand(
        stateFile,
        args.host
      )}`
    );
  }
  const writes = blockedWrites(blocked);
  const sockets = blocked.length - writes;
  if (sockets) {
    console.log(
      `ds:audit: closed ${sockets} WebSocket(s) before they connected.`
    );
  }
  if (writes) {
    console.error(
      [
        '',
        `ds:audit: BLOCKED ${writes} WRITE REQUEST(S). The page tried to change data and the guard stopped it:`,
        ...(report.blocked ?? [])
          .filter((b) => !b.startsWith('WEBSOCKET '))
          .map((b) => `  ${b} (x${blocked.filter((x) => x === b).length})`),
        'Nothing was sent. Check which click caused it before the next run.',
      ].join('\n')
    );
  }
  if (!ok.length) process.exitCode = 1;
};

if (require.main === module) {
  main().catch((e) => {
    console.error(`ds:audit failed: ${e?.message ?? e}`);
    process.exitCode = 1;
  });
}
