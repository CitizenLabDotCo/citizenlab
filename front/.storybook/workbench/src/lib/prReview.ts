// The Review page's logic: one PR per epic. The epic's host names its PR
// (pr-<n>.epic.hq.govocal.com). A PR stacked on the workbench reads what it
// changes from GitHub; the workbench itself from design-changes.json. Each
// design commit is a card with the pictures the agent took before and after
// it and a page it reaches on this platform. Pure functions plus loaders of
// route params and of a stacked PR's commits.
import type { ScanOutput } from './data';
import {
  ChangeCommit,
  commitReach,
  DesignChanges,
  DESIGN_KINDS,
  isDesignCommit,
  resolveRoute,
  RouteFixture,
  shellFiles,
  unfilledParams,
} from './review';
import { REPO, REVIEW_BASE } from './send';

export const REPO_URL = 'https://github.com/CitizenLabDotCo/citizenlab';

const EPIC_HOST = /^pr-(\d{1,7})\.epic\.hq\.govocal\.com$/;

// The PR an epic serves, from its host name; undefined off the epic
// (a local run, another host).
export const prOfHost = (host: string): number | undefined => {
  const m = EPIC_HOST.exec(host);
  return m ? Number(m[1]) : undefined;
};

// Code the platform runs: app files, less what the branch's no-platform-code
// check in .storybook/AGENTS.md leaves out (stories, tests, mocks, a11y
// checklists, the tokens, which the app does not load, and Storybook's
// helpers).
export const isPlatformFile = (file: string) =>
  file.startsWith('front/app/') &&
  !/\.(stories|test)\.tsx?$/.test(file) &&
  !/\/a11y\.json$/.test(file) &&
  !file.includes('/__mocks__/') &&
  !file.startsWith('front/app/design-system/tokens/') &&
  !file.startsWith('front/app/utils/storybook/');

const changesPlatform = (c: ChangeCommit) => c.files.some(isPlatformFile);

// git log lists newest first; a PR reads oldest first.
const oldestFirst = (changes?: DesignChanges) =>
  [...(changes?.commits ?? [])].reverse();

// The PR's design changes: heal, lift and token commits whose platform
// files still differ from the base (design-changes.json drops reverted
// files), oldest first.
export const designChanges = (changes?: DesignChanges): ChangeCommit[] =>
  oldestFirst(changes).filter((c) => isDesignCommit(c) && changesPlatform(c));

// The agent's pictures of a change, in .storybook/static/changes/<sha>/.
export const pictures = (sha: string) => ({
  before: `../changes/${sha}/before.png`,
  after: `../changes/${sha}/after.png`,
});

// The route fixture holds ids of the tenant it was read from. On another
// platform (every epic has its own data) only the params read live from
// this platform are good.
export const forOrigin = (
  fixture: RouteFixture,
  origin: string,
  live: Record<string, string>
): RouteFixture => {
  let own = false;
  try {
    own = new URL(fixture.source?.host ?? '').origin === origin;
  } catch {
    own = false;
  }
  return own ? fixture : { ...fixture, params: { ...live }, paths: {} };
};

// The pages one change reaches, shortest path first, each with its URL on
// `origin` ('' when the platform has no record for a param).
export const routeLinks = (
  scan: ScanOutput,
  commit: ChangeCommit,
  fixture: RouteFixture,
  origin: string,
  shell: Set<string> = shellFiles(scan)
): { path: string; url: string }[] =>
  [...commitReach(scan, commit, shell).routes]
    .sort((a, b) => a.length - b.length || a.localeCompare(b))
    .map((path) => ({
      path,
      url: unfilledParams(path, fixture).length
        ? ''
        : resolveRoute(path, fixture, origin),
    }));

const getJson = async (fetcher: typeof fetch, url: string) => {
  const res = await fetcher(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json();
};

// A project, its slug and its first phase on this platform, from its
// public API, for routes with those params. Empty when it does not answer.
export const liveParams = async (
  origin: string,
  fetcher: typeof fetch = fetch
): Promise<Record<string, string>> => {
  const out: Record<string, string> = {};
  try {
    const projects = await getJson(
      fetcher,
      `${origin}/web_api/v1/projects?page[size]=1`
    );
    const project = projects?.data?.[0];
    if (typeof project?.id !== 'string') return out;
    out.projectId = project.id;
    if (typeof project.attributes?.slug === 'string') {
      out.slug = project.attributes.slug;
    }
    const phases = await getJson(
      fetcher,
      `${origin}/web_api/v1/projects/${project.id}/phases`
    );
    const phase = phases?.data?.[0];
    if (typeof phase?.id === 'string') out.phaseId = phase.id;
  } catch {
    // What was read so far.
  }
  return out;
};

// Mirrors parseSubject in scripts/design-system/changes.ts: the kind from
// the `design-system(<area>)` prefix, the component from the first
// PascalCase word after the colon.
const KINDS: Record<string, ChangeCommit['kind']> = {
  heal: 'heal',
  lift: 'lift',
  token: 'token',
  tokens: 'token',
  design: 'design',
  story: 'story',
  stories: 'story',
};
const NAMED = new Set(['heal', 'lift', 'design', 'story']);
const COMPONENT = /^(?:[A-Za-z]+\/)?[A-Z][a-z0-9]+(?:[A-Z][A-Za-z0-9]*)*$/;

export const kindOfSubject = (
  subject: string
): Pick<ChangeCommit, 'kind' | 'component'> => {
  const m = /^design-system\(([^)]*)\):\s*(.*)$/.exec(subject);
  const kind = (m && KINDS[m[1].trim().toLowerCase()]) || 'other';
  const component = NAMED.has(kind)
    ? m?.[2]
        .split(/\s+/)
        .slice(0, 6)
        .map((w) => w.replace(/[,.:;]+$/, ''))
        .find((w) => COMPONENT.test(w))
    : undefined;
  return component ? { kind, component } : { kind };
};

// The story a commit names on its own line (`Story: <id>`), which the
// Review page shows live before and after.
export const storyOfBody = (body: string) =>
  /^Story:\s*([a-z0-9-]+--[a-z0-9-]+)\s*$/m.exec(body)?.[1];

type GhCommit = { sha: string; commit: { message: string } };
type GhFile = { filename: string };

// A PR stacked on the workbench, from GitHub's public API (the preview's
// build has no git history): its commits, newest first as git log lists
// them, each design commit with the files it changed that still differ
// from the base. Undefined for a PR into any other base (the workbench's
// own list is design-changes.json) or when GitHub does not answer.
export const loadPrChanges = async (
  pr: number,
  fetcher: typeof fetch = fetch
): Promise<DesignChanges | undefined> => {
  const api = `https://api.github.com/repos/${REPO}`;
  try {
    const pull = await getJson(fetcher, `${api}/pulls/${pr}`);
    if (pull?.base?.ref !== REVIEW_BASE) return undefined;
    const commits: GhCommit[] = await getJson(
      fetcher,
      `${api}/pulls/${pr}/commits?per_page=100`
    );
    const files: GhFile[] = await getJson(
      fetcher,
      `${api}/pulls/${pr}/files?per_page=100`
    );
    const differ = new Set(files.map((f) => f.filename));
    const out = await Promise.all(
      commits.map(async (c): Promise<ChangeCommit> => {
        const [subject, ...rest] = c.commit.message.split('\n');
        const parsed = kindOfSubject(subject);
        const own: GhFile[] = DESIGN_KINDS.has(parsed.kind)
          ? (await getJson(fetcher, `${api}/commits/${c.sha}`)).files ?? []
          : [];
        const body = rest.join('\n').trim();
        const story = storyOfBody(body);
        return {
          sha: c.sha,
          subject,
          body,
          files: own.map((f) => f.filename).filter((f) => differ.has(f)),
          ...parsed,
          ...(story ? { story } : {}),
        };
      })
    );
    return {
      generatedAt: new Date().toISOString(),
      base: null,
      baseRef: REVIEW_BASE,
      head: pull.head?.sha ?? '',
      repoUrl: REPO_URL,
      commits: out.reverse(),
      tokenChanges: [],
      warnings: [],
    };
  } catch {
    return undefined;
  }
};

// `design-system(heal): Button 8px → --gv-radius-2 [AI-assisted]` reads
// `Button 8px → --gv-radius-2`.
export const plainSubject = (subject: string) =>
  subject
    .replace(/^[a-z-]+\([^)]*\):\s*/i, '')
    .replace(/\s*\[AI-assisted\]\s*$/, '');

// The session's element edits per story, stories in the order they were
// first edited.
export const byStory = <E extends { storyId: string }>(
  edits: E[]
): [string, E[]][] => {
  const out = new Map<string, E[]>();
  for (const e of edits) out.set(e.storyId, [...(out.get(e.storyId) ?? []), e]);
  return [...out];
};

// What a change touches, from the CSS properties an edit sets.
const PROP_AREAS: [string, RegExp][] = [
  ['Colour', /colou?r|background|fill|stroke/],
  ['Radius', /radius/],
  ['Spacing', /^(padding|margin|gap|row-gap|column-gap)/],
  ['Type', /^(font|line-height|letter-spacing|text-)/],
  ['Shadow', /shadow/],
  ['Border', /^border(-(top|right|bottom|left))?-(width|style)$/],
  ['Size', /^(min-|max-)?(width|height)$/],
  ['Animation', /^(transition|animation)/],
];

export const areasOfProps = (props: string[]): string[] =>
  PROP_AREAS.filter(([, re]) => props.some((p) => re.test(p))).map(
    ([area]) => area
  );

// The same from a commit's words (`HeaderDropdown radius 8px → 12px`).
const TEXT_AREAS: [string, RegExp][] = [
  [
    'Colour',
    /colou?r|fill|background|--gv-(grey|red|green|blue|teal|orange|error|success|warning|tenant|primary|text|bg)/i,
  ],
  ['Radius', /radius/i],
  ['Spacing', /padding|margin|\bgap\b|--gv-space|spacing/i],
  ['Type', /font|line-height|--gv-fs/i],
  ['Shadow', /shadow/i],
  ['Animation', /animation|transition|duration|easing|motion/i],
];

export const areasOfText = (text: string): string[] =>
  TEXT_AREAS.filter(([, re]) => re.test(text)).map(([area]) => area);

// What kind of change a commit is, in a developer's words.
export const KIND_WORDS: Record<string, string> = {
  heal: 'Same look',
  design: 'Look change',
  token: 'Token value',
  lift: 'Whole component',
};

// How far a change reaches: the component's uses in the code and the pages
// that render it.
export const scaleText = (
  component: string | undefined,
  uses: number | undefined,
  pages: number,
  everyPage = false
): string =>
  [
    component,
    uses !== undefined && `used in ${uses} ${uses === 1 ? 'place' : 'places'}`,
    everyPage
      ? 'on every page'
      : pages > 0 && `on ${pages} ${pages === 1 ? 'page' : 'pages'}`,
  ]
    .filter(Boolean)
    .join(' · ');
