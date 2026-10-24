// A pull request as a change list, read from GitHub's public API, so the
// Review page can show any PR: before is this preview (the platform at
// master), after is the PR's own preview. Pure mapping plus one loader.
import type { ChangeCommit, DesignChanges } from './review';

export const REPO = 'CitizenLabDotCo/citizenlab';
const API = `https://api.github.com/repos/${REPO}`;
// Commits read one by one for their files; past this the PR is shown as
// one change with all its files.
export const COMMITS_MAX = 30;

export const prPreviewHost = (n: number) =>
  `https://pr-${n}.epic.hq.govocal.com`;

export const parsePrNumber = (raw: string | null | undefined) => {
  const m = /^#?\s*(\d{1,7})$/.exec((raw ?? '').trim());
  const n = m ? Number(m[1]) : NaN;
  return Number.isInteger(n) && n > 0 ? n : undefined;
};

const KINDS: Record<string, ChangeCommit['kind']> = {
  heal: 'heal',
  lift: 'lift',
  token: 'token',
  tokens: 'token',
  story: 'story',
  stories: 'story',
};

const isPlatformFile = (f: string) =>
  f.startsWith('front/app/') &&
  !/\.(stories|test)\.tsx?$/.test(f) &&
  !f.includes('/__mocks__/');

// The design-system prefix names the kind. Any other commit that changes
// platform code changes how pages render, so it is read as a heal and its
// pages count as reached; the rest (tests, stories, back end) reach none.
export const prCommitKind = (
  subject: string,
  files: string[]
): ChangeCommit['kind'] => {
  const m = /^design-system\(([^)]*)\):/.exec(subject);
  const named = m ? KINDS[m[1].trim().toLowerCase()] : undefined;
  if (named) return named;
  if (files.some(isPlatformFile)) return 'heal';
  if (files.some((f) => /\.stories\.tsx?$/.test(f))) return 'story';
  return 'other';
};

type GhCommit = {
  sha: string;
  commit: { message: string };
  parents?: { sha: string }[];
  files?: { filename: string }[];
};

// A merge brings master's commits in; its diff is not the PR's change.
const isMerge = (c: GhCommit) => (c.parents?.length ?? 0) > 1;
type GhPull = {
  number: number;
  title: string;
  html_url: string;
  state: string;
  merged_at: string | null;
  head: { ref: string; sha: string };
  base: { ref: string; sha: string };
};

export type PullRequest = {
  number: number;
  title: string;
  url: string;
  state: 'open' | 'closed' | 'merged';
  branch: string;
  changes: DesignChanges;
};

const split = (message: string) => {
  const [subject, ...rest] = message.split('\n');
  return { subject: subject.trim(), body: rest.join('\n').trim() };
};

export const toChanges = (
  pull: GhPull,
  commits: GhCommit[],
  allFiles: string[]
): DesignChanges => {
  const warnings: string[] = [];
  let list: ChangeCommit[];
  if (commits.length > COMMITS_MAX || commits.some((c) => !c.files)) {
    warnings.push(
      `${commits.length} commits: shown as one change with all ${allFiles.length} files.`
    );
    list = [
      {
        sha: pull.head.sha,
        subject: pull.title,
        body: '',
        files: allFiles,
        kind: prCommitKind(pull.title, allFiles),
      },
    ];
  } else {
    list = commits
      .filter((c) => !isMerge(c))
      .map((c) => {
        const files = (c.files ?? []).map((f) => f.filename);
        return {
          ...split(c.commit.message),
          sha: c.sha,
          files,
          kind: prCommitKind(split(c.commit.message).subject, files),
        };
      });
  }
  return {
    generatedAt: new Date().toISOString(),
    base: pull.base.sha,
    baseRef: pull.base.ref,
    head: pull.head.sha,
    repoUrl: `https://github.com/${REPO}`,
    commits: list,
    tokenChanges: [],
    warnings,
  };
};

const get = async <T>(path: string, fetcher: typeof fetch): Promise<T> => {
  const res = await fetcher(`${API}${path}`, {
    headers: { Accept: 'application/vnd.github+json' },
  });
  if (!res.ok) {
    throw new Error(
      res.status === 404
        ? 'No such pull request.'
        : res.status === 403
        ? 'GitHub limits reads to 60 an hour from one address; try again later.'
        : `GitHub answered ${res.status}.`
    );
  }
  return (await res.json()) as T;
};

export const loadPullRequest = async (
  n: number,
  fetcher: typeof fetch = fetch
): Promise<PullRequest> => {
  const pull = await get<GhPull>(`/pulls/${n}`, fetcher);
  const [listed, files] = await Promise.all([
    get<GhCommit[]>(`/pulls/${n}/commits?per_page=100`, fetcher),
    get<{ filename: string }[]>(`/pulls/${n}/files?per_page=100`, fetcher),
  ]);
  const own = listed.filter((c) => !isMerge(c));
  const commits =
    own.length > COMMITS_MAX
      ? own
      : await Promise.all(
          own.map((c) => get<GhCommit>(`/commits/${c.sha}`, fetcher))
        );
  return {
    number: pull.number,
    title: pull.title,
    url: pull.html_url,
    state: pull.merged_at
      ? 'merged'
      : pull.state === 'open'
      ? 'open'
      : 'closed',
    branch: pull.head.ref,
    changes: toChanges(
      pull,
      commits,
      files.map((f) => f.filename)
    ),
  };
};
