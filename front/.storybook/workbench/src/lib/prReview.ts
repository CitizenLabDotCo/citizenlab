// The Review page's logic: one PR per epic. The epic's host names its PR
// (pr-<n>.epic.hq.govocal.com), design-changes.json lists what the branch
// changes against the PR's base, and each design commit is a card with the
// pictures the agent took before and after it and the pages it reaches on
// this platform. Pure functions plus one loader of route params.
import type { ScanOutput } from './data';
import type { PullHeader } from './pr';
import {
  ChangeCommit,
  commitReach,
  DesignChanges,
  isDesignCommit,
  resolveRoute,
  RouteFixture,
  shellFiles,
  unfilledParams,
} from './review';

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

// The rest of the PR: commits that change platform code without being a
// design change (setup, such as the app loading the tokens) are listed;
// stories and tooling are counted.
export const alsoInPr = (
  changes?: DesignChanges
): { setup: ChangeCommit[]; stories: number; tooling: number } => {
  const rest = oldestFirst(changes).filter(
    (c) => !(isDesignCommit(c) && changesPlatform(c))
  );
  return {
    setup: rest.filter((c) => c.kind === 'other' && changesPlatform(c)),
    stories: rest.filter((c) => c.kind === 'story').length,
    tooling: rest.filter((c) => c.kind !== 'story' && !changesPlatform(c))
      .length,
  };
};

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

// `design-system(heal): Button 8px → --gv-radius-2 [AI-assisted]` reads
// `Button 8px → --gv-radius-2`.
export const plainSubject = (subject: string) =>
  subject
    .replace(/^[a-z-]+\([^)]*\):\s*/i, '')
    .replace(/\s*\[AI-assisted\]\s*$/, '');

const plural = (n: number, one: string, many: string) =>
  `${n} ${n === 1 ? one : many}`;

// The PR text's Review section: the link first, then the changes in order.
export const prText = (
  head: PullHeader | undefined,
  cards: ChangeCommit[],
  link: string,
  repoUrl: string
): string =>
  [
    '## Review',
    '',
    `[${plural(cards.length, 'change', 'changes')}, before and after](${link})${
      head ? ` on the epic of #${head.number}.` : '.'
    }`,
    '',
    ...cards.map(
      (c, i) =>
        `${i + 1}. ${plainSubject(c.subject)} ([${c.sha.slice(
          0,
          7
        )}](${repoUrl}/commit/${c.sha}))`
    ),
  ].join('\n');
