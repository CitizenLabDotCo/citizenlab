// The pull request an epic serves, read from GitHub's public API (60 reads
// an hour from one address; the page reads it once per session).
export const REPO = 'CitizenLabDotCo/citizenlab';
const API = `https://api.github.com/repos/${REPO}`;

export type PullHeader = {
  number: number;
  title: string;
  url: string;
  state: 'open' | 'closed' | 'merged';
  // The branch the PR merges into.
  base: string;
};

type GhPull = {
  number: number;
  title: string;
  html_url: string;
  state: string;
  merged_at: string | null;
  base: { ref: string };
};

export const loadPullHeader = async (
  n: number,
  fetcher: typeof fetch = fetch
): Promise<PullHeader> => {
  const res = await fetcher(`${API}/pulls/${n}`, {
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
  const pull = (await res.json()) as GhPull;
  return {
    number: pull.number,
    title: pull.title,
    url: pull.html_url,
    state: pull.merged_at
      ? 'merged'
      : pull.state === 'open'
      ? 'open'
      : 'closed',
    base: pull.base.ref,
  };
};
