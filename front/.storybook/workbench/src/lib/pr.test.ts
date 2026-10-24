import {
  COMMITS_MAX,
  loadPullRequest,
  parsePrNumber,
  prCommitKind,
  prPreviewHost,
  toChanges,
} from './pr';
import { parseReviewHash, reviewHash } from './review';

const pull = {
  number: 15100,
  title: 'AI analysis button uses the admin colour',
  html_url: 'https://github.com/CitizenLabDotCo/citizenlab/pull/15100',
  state: 'open',
  merged_at: null,
  head: { ref: 'design-system/ai-analysis-button', sha: 'h1' },
  base: { ref: 'master', sha: 'b1' },
};
const insights =
  'front/app/containers/Admin/projects/project/insights/index.tsx';

describe('parsePrNumber', () => {
  it('reads a number with or without #', () => {
    expect(parsePrNumber('15100')).toBe(15100);
    expect(parsePrNumber(' #42 ')).toBe(42);
  });
  it('rejects anything else', () => {
    ['', '0', 'abc', '12a', '-3', undefined, null].forEach((v) =>
      expect(parsePrNumber(v)).toBeUndefined()
    );
  });
});

describe('prPreviewHost', () => {
  it('is the PR preview', () => {
    expect(prPreviewHost(7)).toBe('https://pr-7.epic.hq.govocal.com');
  });
});

describe('prCommitKind', () => {
  it('takes the design-system prefix', () => {
    expect(prCommitKind('design-system(token): radius', [])).toBe('token');
    expect(prCommitKind('design-system(lift): Card', [])).toBe('lift');
  });
  it('reads any platform change as a heal', () => {
    expect(prCommitKind('Fix the button', [insights])).toBe('heal');
  });
  it('keeps tests, mocks and stories out of the reach', () => {
    expect(
      prCommitKind('Tests', [
        'front/app/a/b.test.tsx',
        'front/app/api/x/__mocks__/_mockServer.ts',
      ])
    ).toBe('other');
    expect(prCommitKind('Story', ['front/app/a/B.stories.tsx'])).toBe('story');
    expect(prCommitKind('Back end', ['back/app/models/x.rb'])).toBe('other');
  });
});

describe('toChanges', () => {
  it('maps each commit with its files', () => {
    const c = toChanges(
      pull,
      [
        {
          sha: 's1',
          commit: { message: 'design-system(heal): AI button\n\nWhy.' },
          files: [{ filename: insights }],
        },
      ],
      [insights]
    );
    expect(c.base).toBe('b1');
    expect(c.commits).toEqual([
      {
        sha: 's1',
        subject: 'design-system(heal): AI button',
        body: 'Why.',
        files: [insights],
        kind: 'heal',
      },
    ]);
    expect(c.warnings).toEqual([]);
  });
  it('leaves merge commits out', () => {
    const c = toChanges(
      pull,
      [
        {
          sha: 'm1',
          commit: { message: "Merge branch 'master'" },
          parents: [{ sha: 'a' }, { sha: 'b' }],
          files: [{ filename: insights }],
        },
      ],
      [insights]
    );
    expect(c.commits).toEqual([]);
  });
  it('folds a long PR into one change', () => {
    const many = Array.from({ length: COMMITS_MAX + 1 }, (_, i) => ({
      sha: `s${i}`,
      commit: { message: `c${i}` },
    }));
    const c = toChanges(pull, many, [insights]);
    expect(c.commits).toHaveLength(1);
    expect(c.commits[0]).toMatchObject({ subject: pull.title, kind: 'heal' });
    expect(c.warnings[0]).toMatch(/31 commits/);
  });
});

describe('loadPullRequest', () => {
  const reply = (body: unknown, status = 200) =>
    Promise.resolve({
      ok: status === 200,
      status,
      json: () => Promise.resolve(body),
    } as Response);

  it('reads the PR, its commits and their files', async () => {
    const seen: string[] = [];
    const fetcher = ((url: string) => {
      seen.push(url.replace(/^.*citizenlab/, ''));
      if (url.endsWith('/pulls/15100')) return reply(pull);
      if (url.includes('/pulls/15100/commits'))
        return reply([{ sha: 's1', commit: { message: 'm' } }]);
      if (url.includes('/pulls/15100/files'))
        return reply([{ filename: insights }]);
      return reply({
        sha: 's1',
        commit: { message: 'Fix the AI button' },
        files: [{ filename: insights }],
      });
    }) as typeof fetch;
    const pr = await loadPullRequest(15100, fetcher);
    expect(pr).toMatchObject({
      number: 15100,
      state: 'open',
      branch: 'design-system/ai-analysis-button',
    });
    expect(pr.changes.commits[0].kind).toBe('heal');
    expect(seen).toContain('/commits/s1');
  });

  it('says plainly when the PR is missing', async () => {
    const fetcher = (() => reply({}, 404)) as unknown as typeof fetch;
    await expect(loadPullRequest(1, fetcher)).rejects.toThrow(
      'No such pull request.'
    );
  });
});

describe('the pr in the review hash', () => {
  it('round-trips', () => {
    const s = parseReviewHash('#/review?pr=15100&only=1');
    expect(s.pr).toBe(15100);
    expect(reviewHash('#/review', s)).toBe('#/review?only=1&pr=15100');
  });
  it('opens a PR on the pages it reaches, unless turned off', () => {
    expect(parseReviewHash('#/review?pr=7').only).toBe(true);
    const off = parseReviewHash('#/review?pr=7&only=0');
    expect(off.only).toBe(false);
    expect(reviewHash('#/review', off)).toBe('#/review?only=0&pr=7');
  });
  it('ignores a bad value', () => {
    expect(parseReviewHash('#/review?pr=x').pr).toBeUndefined();
  });
});
