import fs from 'fs';
import os from 'os';
import path from 'path';

import {
  buildChanges,
  parseLog,
  parseSubject,
  RunGit,
  SCAN_SUMMARY,
  TOKENS_SOURCE,
  tokenChanges,
  writeChanges,
} from './changes';

const source = (
  tokens: Record<string, { today: string; redesign?: string }>
) => ({
  primitive: {
    radius: Object.fromEntries(
      Object.entries(tokens).map(([key, v]) => [
        key,
        {
          $type: 'dimension',
          $value: v.today,
          ...(v.redesign
            ? { $extensions: { gv: { redesign: v.redesign } } }
            : {}),
        },
      ])
    ),
  },
});

const RS = '\x1e';
const US = '\x1f';
const logEntry = (
  sha: string,
  subject: string,
  body: string,
  files: string[]
) => `${RS}${sha}${US}${subject}${US}${body}${US}\n\n${files.join('\n')}\n`;

const LOG = [
  logEntry(
    'c3',
    'design-system(heal): Button 8px → --gv-radius-control [AI-assisted]',
    'Heals the corner.\n\nCo-Authored-By: x',
    ['front/app/component-library/components/Button/index.tsx', SCAN_SUMMARY]
  ),
  logEntry(
    'c2',
    'design-system(lift): Stepper from backofficeRedesign/steps [AI-assisted]',
    '',
    ['front/app/component-library/components/Stepper/index.tsx']
  ),
  logEntry(
    'c1',
    'design-system(stories): add GoBackButton stories, tagged shared [AI-assisted]',
    '',
    ['front/app/components/UI/GoBackButton/GoBackButton.stories.tsx']
  ),
  logEntry(
    'c0',
    'design-system(tokens): one source, generated CSS variables [AI-assisted]',
    '',
    [TOKENS_SOURCE]
  ),
  logEntry('cx', 'Fix a typo in the README', '', ['README.md']),
].join('');

const fakeGit =
  (opts: {
    refs?: Record<string, string>;
    objects?: Record<string, string>;
    log?: string;
  }): RunGit =>
  (args) => {
    const [cmd, ...rest] = args;
    if (cmd === 'rev-parse' && rest[0] === 'HEAD') return 'headsha\n';
    if (cmd === 'merge-base') return opts.refs?.[rest[1]];
    if (cmd === 'cat-file') {
      const sha = rest[1].replace(/\^\{commit\}$/, '');
      return Object.values(opts.refs ?? {}).some((s) => s.trim() === sha)
        ? ''
        : undefined;
    }
    if (cmd === 'log') return opts.log;
    if (cmd === 'show') return opts.objects?.[rest[0]];
    return undefined;
  };

describe('parseSubject', () => {
  it('reads the kind from the design-system(<area>) prefix', () => {
    expect(parseSubject('design-system(heal): Button 8px → x').kind).toBe(
      'heal'
    );
    expect(parseSubject('design-system(lift): Stepper from y').kind).toBe(
      'lift'
    );
    expect(parseSubject('design-system(tokens): one source').kind).toBe(
      'token'
    );
    expect(parseSubject('design-system(stories): add X stories').kind).toBe(
      'story'
    );
    expect(parseSubject('design-system(scan): faster').kind).toBe('other');
    expect(parseSubject('Fix a typo').kind).toBe('other');
  });

  it('reads the component name after the colon', () => {
    expect(parseSubject('design-system(heal): Button 8px → x').component).toBe(
      'Button'
    );
    expect(
      parseSubject('design-system(heal): UI/Error 4px → x').component
    ).toBe('UI/Error');
    expect(
      parseSubject('design-system(stories): add GoBackButton stories').component
    ).toBe('GoBackButton');
    // Not a component change: no name guessed from ordinary words.
    expect(
      parseSubject('design-system(workbench): Review page').component
    ).toBeUndefined();
  });

  it('prefers a known component name when the list is given', () => {
    expect(
      parseSubject('design-system(heal): the Box 8px gap', ['Box', 'Button'])
        .component
    ).toBe('Box');
  });

  it('takes only the first word after the colon for other kinds', () => {
    const known = ['Button', 'Box'];
    expect(
      parseSubject(
        'design-system(smoke): find the Button story under its id',
        known
      ).component
    ).toBeUndefined();
    expect(
      parseSubject('design-system(scan): Box reach fix', known).component
    ).toBe('Box');
  });
});

describe('parseLog', () => {
  it('splits commits with subject, body and files', () => {
    const commits = parseLog(LOG);
    expect(commits.map((c) => c.sha)).toEqual(['c3', 'c2', 'c1', 'c0', 'cx']);
    expect(commits[0]).toEqual({
      sha: 'c3',
      subject:
        'design-system(heal): Button 8px → --gv-radius-control [AI-assisted]',
      body: 'Heals the corner.\n\nCo-Authored-By: x',
      files: [
        'front/app/component-library/components/Button/index.tsx',
        SCAN_SUMMARY,
      ],
    });
  });
});

describe('tokenChanges', () => {
  it('lists changed, added and removed tokens with values per mode', () => {
    const base = source({
      control: { today: '3px', redesign: '8px' },
      card: { today: '4px' },
      old: { today: '2px' },
    });
    const head = source({
      control: { today: '3px', redesign: '6px' },
      card: { today: '4px' },
      pill: { today: '999px' },
    });
    expect(tokenChanges(base, head)).toEqual([
      {
        name: '--gv-radius-control',
        from: { today: '3px', redesign: '8px' },
        to: { today: '3px', redesign: '6px' },
      },
      {
        name: '--gv-radius-old',
        from: { today: '2px', redesign: '2px' },
        to: null,
      },
      {
        name: '--gv-radius-pill',
        from: null,
        to: { today: '999px', redesign: '999px' },
      },
    ]);
  });
});

describe('buildChanges', () => {
  const objects = {
    [`base1:${TOKENS_SOURCE}`]: JSON.stringify(
      source({ control: { today: '3px', redesign: '8px' } })
    ),
    [`HEAD:${TOKENS_SOURCE}`]: JSON.stringify(
      source({ control: { today: '3px', redesign: '6px' } })
    ),
    [`c3:${SCAN_SUMMARY}`]: JSON.stringify({ offSpec: 95 }),
    [`c3^:${SCAN_SUMMARY}`]: JSON.stringify({ offSpec: 100 }),
  };

  it('lists commits since the merge-base with kinds, components and scan deltas', () => {
    const out = buildChanges({
      runGit: fakeGit({ refs: { master: 'base1\n' }, objects, log: LOG }),
    });
    expect(out.base).toBe('base1');
    expect(out.head).toBe('headsha');
    expect(out.warnings).toEqual([]);
    expect(
      out.commits.map((c) => [c.sha, c.kind, c.component, c.scanDelta])
    ).toEqual([
      ['c3', 'heal', 'Button', { offSpec: -5 }],
      ['c2', 'lift', 'Stepper', undefined],
      ['c1', 'story', 'GoBackButton', undefined],
      ['c0', 'token', undefined, undefined],
      ['cx', 'other', undefined, undefined],
    ]);
    expect(out.tokenChanges).toEqual([
      {
        name: '--gv-radius-control',
        from: { today: '3px', redesign: '8px' },
        to: { today: '3px', redesign: '6px' },
      },
    ]);
  });

  it('falls back to origin/master, then the cached merge-base', () => {
    expect(
      buildChanges({
        runGit: fakeGit({ refs: { 'origin/master': 'base2' }, log: '' }),
      }).base
    ).toBe('base2');
    const cached = buildChanges({
      runGit: fakeGit({ refs: { other: 'base3' }, log: '' }),
      cachedMergeBase: 'base3',
    });
    expect(cached.base).toBe('base3');
    expect(cached.warnings).toEqual([
      expect.stringMatching(/cached merge-base base3/),
    ]);
  });

  it('writes no commits and a warning when no base is found', () => {
    const out = buildChanges({ runGit: fakeGit({ log: LOG }) });
    expect(out.base).toBeNull();
    expect(out.commits).toEqual([]);
    expect(out.tokenChanges).toEqual([]);
    expect(out.warnings).toEqual([
      expect.stringMatching(/no merge-base.*no merge-base is cached/),
    ]);
  });

  it('says when the cached merge-base is not in this clone', () => {
    const out = buildChanges({
      runGit: fakeGit({ log: '' }),
      cachedMergeBase: 'gone',
    });
    expect(out.base).toBeNull();
    expect(out.warnings).toEqual([
      expect.stringMatching(/cached merge-base gone is not in this clone/),
    ]);
  });

  it('keeps every warning, not only the last', () => {
    const out = buildChanges({
      runGit: fakeGit({ refs: { other: 'base3' } }),
      cachedMergeBase: 'base3',
    });
    expect(out.warnings).toHaveLength(2);
    expect(out.warnings[0]).toMatch(/cached merge-base/);
    expect(out.warnings[1]).toMatch(/git log .* failed/);
  });

  it('reports no per-token changes when the base has no token source', () => {
    const out = buildChanges({
      runGit: fakeGit({
        refs: { master: 'base1' },
        objects: {
          [`HEAD:${TOKENS_SOURCE}`]: objects[`HEAD:${TOKENS_SOURCE}`],
        },
        log: '',
      }),
    });
    expect(out.tokenChanges).toEqual([]);
    expect(out.tokensNew).toBe(1);
  });
});

describe('writeChanges', () => {
  // CI clones with --depth 1: no base is reachable there, so the committed
  // file (refreshed locally) must survive the build.
  const dir = () => fs.mkdtempSync(path.join(os.tmpdir(), 'ds-changes-'));
  const noBase = () => buildChanges({ runGit: fakeGit({ log: '' }) });

  it('keeps the committed file untouched when no base is reachable', () => {
    const file = path.join(dir(), 'design-changes.json');
    const committed = '{"base":"b","commits":[{"sha":"c1"}]}\n';
    fs.writeFileSync(file, committed);
    expect(writeChanges(file, noBase())).toBe('kept');
    expect(fs.readFileSync(file, 'utf8')).toBe(committed);
  });

  it('writes the empty list when there is no file to keep', () => {
    const file = path.join(dir(), 'design-changes.json');
    expect(writeChanges(file, noBase())).toBe('written');
    expect(JSON.parse(fs.readFileSync(file, 'utf8')).commits).toEqual([]);
  });

  it('overwrites the file when a base was found', () => {
    const file = path.join(dir(), 'design-changes.json');
    fs.writeFileSync(file, '{"old":true}\n');
    const fresh = buildChanges({
      runGit: fakeGit({ refs: { master: 'base1' }, log: LOG }),
    });
    expect(writeChanges(file, fresh)).toBe('written');
    expect(JSON.parse(fs.readFileSync(file, 'utf8')).base).toBe('base1');
  });
});
