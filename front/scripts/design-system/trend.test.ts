import fs from 'fs';
import os from 'os';
import path from 'path';

import {
  areaOf,
  buildTrend,
  healExampleOf,
  healNotesOf,
  parseTrendLog,
  SCAN_SUMMARY,
  serializeTrend,
  shotsOf,
  totalsOf,
  Trend,
  TREND_LOG_FORMAT,
  writeTrend,
} from './trend';

import type { RunGit } from './changes';

const RS = '\x1e';
const US = '\x1f';
const entry = (sha: string, date: string, subject: string, body = '') =>
  `${RS}${sha}${US}${date}${US}${subject}${US}${body}\n`;

const summary = (offSpec: number, tokenReads: number) =>
  JSON.stringify({
    generatedAt: 'x',
    offSpec,
    legacy: 10,
    tokenReads,
    components: 3,
    onTokens: 1,
  });

const DIFF = [
  'diff --git a/front/app/A.tsx b/front/app/A.tsx',
  '--- a/front/app/A.tsx',
  '+++ b/front/app/A.tsx',
  '@@ -3,0 +4 @@',
  "+import { t } from 'design-system/tokens/tokens';",
  '@@ -35 +36 @@',
  '-      gap="8px"',
  '-      gap="8px"',
  '+      gap={t.space[2]}',
  'diff --git a/front/app/B.tsx b/front/app/B.tsx',
  '--- a/front/app/B.tsx',
  '+++ b/front/app/B.tsx',
  '-other',
].join('\n');

const fakeGit =
  (opts: { shallow?: boolean; log?: string | undefined }): RunGit =>
  (args) => {
    if (args[0] === 'rev-parse') return opts.shallow ? 'true\n' : 'false\n';
    if (args[0] === 'log') return opts.log;
    if (args[0] === 'show' && args[1] === `c1:${SCAN_SUMMARY}`)
      {return summary(100, 0);}
    if (args[0] === 'show' && args[1] === `c2:${SCAN_SUMMARY}`)
      {return summary(99, 1);}
    if (args[0] === 'show' && args[1] === `c3:${SCAN_SUMMARY}`) return '{bad';
    if (args[0] === 'show' && args[1] === '--format=') return DIFF;
    return undefined;
  };

const LOG =
  entry('c1', '2026-10-22T10:00:00Z', 'design-system(scan): first') +
  entry(
    'c2',
    '2026-10-22T11:00:00Z',
    'design-system(heal): A 8px → --gv-space-2 [AI-assisted]',
    'Score 0.000 → 0.118 (file).\nVisual compare: x, today 0 diffs, redesign 2 diffs.\nScreenshots: .storybook/static/heals/abc1234/\n'
  ) +
  entry('c3', '2026-10-22T12:00:00Z', 'design-system(scan): broken');

describe('trend', () => {
  it('parses the log format', () => {
    expect(TREND_LOG_FORMAT).toContain('%cI');
    expect(parseTrendLog(LOG)).toEqual([
      {
        sha: 'c1',
        date: '2026-10-22T10:00:00Z',
        subject: 'design-system(scan): first',
        body: '',
      },
      expect.objectContaining({ sha: 'c2', body: expect.any(String) }),
      expect.objectContaining({ sha: 'c3' }),
    ]);
  });

  it('reads the area, totals and screenshot folder', () => {
    expect(areaOf('design-system(Heal): x')).toBe('heal');
    expect(areaOf('Fix the thing')).toBe('other');
    expect(totalsOf(JSON.parse(summary(5, 2)))).toEqual({
      offSpec: 5,
      legacy: 10,
      tokenReads: 2,
      components: 3,
      onTokens: 1,
    });
    expect(totalsOf({ offSpec: 1 })).toBeUndefined();
    expect(totalsOf(null)).toBeUndefined();
    expect(shotsOf('Screenshots: .storybook/static/heals/5be0131cb50/')).toBe(
      'heals/5be0131cb50'
    );
    expect(shotsOf('no shots')).toBeUndefined();
  });

  it('takes the first file of a diff, without imports or repeats', () => {
    expect(healExampleOf(DIFF)).toEqual({
      file: 'front/app/A.tsx',
      removed: ['      gap="8px"'],
      added: ['      gap={t.space[2]}'],
    });
    expect(healExampleOf('')).toBeUndefined();
  });

  it('reads the score and the visual compare of a heal body', () => {
    expect(healNotesOf('Score 0.5 → 0.588 (file)')).toEqual({
      score: { from: 0.5, to: 0.588 },
    });
    expect(
      healNotesOf('today 0 diffs,\nredesign 1 diff, at threshold 0')
    ).toEqual({ diffs: { today: 0, redesign: 1 } });
    expect(healNotesOf('nothing')).toEqual({});
  });

  it('builds points oldest first and skips unreadable summaries', () => {
    const result = buildTrend(fakeGit({ log: LOG }));
    expect(result.trend?.points.map((p) => p.sha)).toEqual(['c1', 'c2']);
    const heal = result.trend?.points[1];
    expect(heal?.area).toBe('heal');
    expect(heal?.totals.offSpec).toBe(99);
    expect(heal?.heal).toEqual({
      file: 'front/app/A.tsx',
      removed: ['      gap="8px"'],
      added: ['      gap={t.space[2]}'],
      shots: 'heals/abc1234',
      score: { from: 0, to: 0.118 },
      diffs: { today: 0, redesign: 2 },
    });
  });

  it('gives no trend for a shallow clone, a failing log or no history', () => {
    expect(buildTrend(fakeGit({ shallow: true, log: LOG })).trend).toBe(
      undefined
    );
    expect(buildTrend(fakeGit({ log: undefined })).trend).toBe(undefined);
    expect(buildTrend(fakeGit({ log: '' })).trend).toBe(undefined);
  });

  describe('writeTrend', () => {
    let dir: string;
    let file: string;
    const good: Trend = {
      file: SCAN_SUMMARY,
      points: [
        {
          sha: 'c1',
          date: 'd',
          subject: 's',
          area: 'scan',
          totals: {
            offSpec: 1,
            legacy: 1,
            tokenReads: 0,
            components: 1,
            onTokens: 0,
          },
        },
      ],
    };
    beforeEach(() => {
      dir = fs.mkdtempSync(path.join(os.tmpdir(), 'trend-'));
      file = path.join(dir, 'trend.json');
    });
    afterEach(() => fs.rmSync(dir, { recursive: true, force: true }));

    it('writes, then leaves an identical file untouched', () => {
      expect(writeTrend(file, { trend: good })).toBe('written');
      const mtime = fs.statSync(file).mtimeMs;
      expect(writeTrend(file, { trend: good })).toBe('unchanged');
      expect(fs.statSync(file).mtimeMs).toBe(mtime);
      expect(fs.readFileSync(file, 'utf8')).toBe(serializeTrend(good));
    });

    it('keeps the committed file when there is no trend', () => {
      fs.writeFileSync(file, serializeTrend(good));
      expect(writeTrend(file, { reason: 'shallow' })).toBe('kept');
      expect(fs.readFileSync(file, 'utf8')).toBe(serializeTrend(good));
      fs.rmSync(file);
      expect(writeTrend(file, { reason: 'shallow' })).toBe('none');
      expect(fs.existsSync(file)).toBe(false);
    });
  });
});
