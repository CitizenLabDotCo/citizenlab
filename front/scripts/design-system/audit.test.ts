import {
  auditIndex,
  AuditInstance,
  codegenCommand,
  compareInstances,
  compareWithStory,
  findStory,
  healTasks,
  inconsistencies,
  instanceLabel,
  parseArgs,
  planVisits,
  shorthand,
  sizeClass,
  StoryCapture,
} from './audit';

import type { ScanOutput, TokenMeta } from './scan/schema';

const styles = (over: Partial<AuditInstance['styles']> = {}) => ({
  radius: '4px',
  padding: '8px',
  color: 'rgb(0, 0, 0)',
  background: 'rgb(255, 255, 255)',
  fontSize: '14px',
  ...over,
});

const instance = (over: Partial<AuditInstance> = {}): AuditInstance => ({
  route: 'admin/projects/$projectId',
  office: 'admin',
  url: 'https://host/en/admin/projects/p1',
  viewport: 'desktop',
  width: 1280,
  index: 0,
  count: 1,
  shot: 'audits/PanelField/x.png',
  box: { width: 300, height: 40 },
  size: sizeClass(300, 40),
  styles: styles(),
  tokens: { linked: ['--gv-radius-1'], equal: [] },
  diffsFromStory: [],
  ...over,
});

describe('compareInstances', () => {
  it('finds nothing when the instances look the same', () => {
    expect(compareInstances(instance(), instance({ route: 'b' }))).toEqual([]);
  });

  it('names both routes when the radius differs', () => {
    const lines = compareInstances(
      instance({ route: 'admin/a' }),
      instance({ route: 'admin/b', styles: styles({ radius: '8px' }) })
    );
    expect(lines).toEqual([
      'radius: 4px on /admin/a (1280) vs 8px on /admin/b (1280)',
    ]);
  });

  it('reports size class, colour and token differences', () => {
    const lines = compareInstances(
      instance({ route: 'admin/a' }),
      instance({
        route: 'admin/b',
        box: { width: 600, height: 40 },
        size: sizeClass(600, 40),
        styles: styles({ background: 'rgb(1, 2, 3)' }),
        tokens: { linked: [], equal: ['--gv-radius-1', '--gv-space-2'] },
      })
    );
    expect(lines).toEqual([
      'size: w:l h:s on /admin/a (1280) vs w:xl h:s on /admin/b (1280)',
      'background: rgb(255, 255, 255) on /admin/a (1280) vs rgb(1, 2, 3) on /admin/b (1280)',
      'tokens: --gv-space-2 only on /admin/b (1280)',
      'tokens: --gv-radius-1 read through var() on /admin/a (1280), value only matches on /admin/b (1280)',
    ]);
  });

  it('labels instances by position when a route has several', () => {
    const a = instance({ route: 'admin/a', index: 0, count: 2 });
    const b = instance({
      route: 'admin/a',
      index: 1,
      count: 2,
      styles: styles({ padding: '4px' }),
    });
    expect(instanceLabel(b)).toBe('/admin/a #2 (1280)');
    expect(compareInstances(a, b)).toEqual([
      'padding: 8px on /admin/a #1 (1280) vs 4px on /admin/a #2 (1280)',
    ]);
  });

  it('never compares across viewports or with a failed instance', () => {
    expect(
      compareInstances(
        instance(),
        instance({
          viewport: 'mobile',
          width: 390,
          styles: styles({ radius: '0px' }),
        })
      )
    ).toEqual([]);
    expect(
      compareInstances(
        instance(),
        instance({ error: 'login', styles: styles({ radius: '0px' }) })
      )
    ).toEqual([]);
  });
});

describe('sizeClass and shorthand', () => {
  it('buckets each side', () => {
    expect(sizeClass(10, 100)).toBe('w:xs h:m');
    expect(sizeClass(479, 480)).toBe('w:l h:xl');
  });

  it('writes the shortest CSS shorthand', () => {
    expect(shorthand(['8px', '8px', '8px', '8px'])).toBe('8px');
    expect(shorthand(['8px', '12px', '8px', '12px'])).toBe('8px 12px');
    expect(shorthand(['1px', '2px', '3px', '2px'])).toBe('1px 2px 3px');
    expect(shorthand(['1px', '2px', '3px', '4px'])).toBe('1px 2px 3px 4px');
  });
});

const story = (over: Partial<StoryCapture> = {}): StoryCapture => ({
  id: 'components-forms-panelfield--default',
  mode: 'redesign',
  viewport: 'desktop',
  width: 1280,
  root: 'tag',
  shot: 'audits/PanelField/story.png',
  styles: styles(),
  tokens: { linked: ['--gv-radius-1'], equal: [] },
  ...over,
});

describe('compareWithStory', () => {
  it('is empty for an instance that renders like the story', () => {
    expect(compareWithStory(instance(), story())).toEqual([]);
  });

  it('names the property, both values and the story', () => {
    expect(
      compareWithStory(
        instance({
          styles: styles({ radius: '8px' }),
          tokens: { linked: [], equal: [] },
        }),
        story()
      )
    ).toEqual([
      'radius: 8px, story components-forms-panelfield--default 4px',
      'tokens: --gv-radius-1 in the story, not here',
    ]);
  });

  it('compares tokens only when the story root carries no tag', () => {
    expect(
      compareWithStory(
        instance({ styles: styles({ radius: '8px' }) }),
        story({ root: 'storybook-root' })
      )
    ).toEqual([]);
  });

  it('cuts long token lists', () => {
    const many = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].map(
      (n) => `--gv-${n}`
    );
    expect(
      compareWithStory(
        instance({ tokens: { linked: [], equal: [] } }),
        story({ tokens: { linked: [], equal: many } })
      )
    ).toEqual([
      'tokens: --gv-a, --gv-b, --gv-c, --gv-d, --gv-e, --gv-f and 2 more in the story, not here',
    ]);
  });

  it('says so when there is no story to compare with', () => {
    expect(compareWithStory(instance(), undefined)).toEqual([
      'no Default story captured',
    ]);
  });
});

describe('inconsistencies', () => {
  it('dedupes the pairwise lines', () => {
    const a = instance({ route: 'admin/a' });
    const b = instance({ route: 'admin/b', styles: styles({ radius: '8px' }) });
    const c = instance({ route: 'admin/c' });
    expect(inconsistencies([a, b, c])).toEqual([
      'radius: 4px on /admin/a (1280) vs 8px on /admin/b (1280)',
      'radius: 8px on /admin/b (1280) vs 4px on /admin/c (1280)',
    ]);
  });
});

const meta: TokenMeta[] = [
  {
    name: '--gv-radius-1',
    category: 'radius',
    tier: 1,
    values: { today: '4px', redesign: '4px' },
    legacy: [],
  },
  {
    name: '--gv-radius-control',
    category: 'radius',
    tier: 2,
    values: { today: '3px', redesign: '4px' },
    legacy: [],
  },
  {
    name: '--gv-space-2',
    category: 'space',
    tier: 1,
    values: { today: '8px', redesign: '8px' },
    legacy: [],
  },
  {
    name: '--gv-text-primary',
    category: 'color',
    tier: 2,
    values: { today: '#000000', redesign: '#000000' },
    legacy: [],
  },
];

const scan = {
  components: [
    {
      component: 'PanelField',
      file: 'app/component-library/components/PanelField/index.tsx',
      routes: ['admin/a', 'admin/b', 'admin/c'],
    },
  ],
  usages: [
    {
      component: 'PanelField',
      file: 'app/component-library/index.tsx',
      line: 56,
      props: [],
    },
    { component: 'PanelField', file: 'app/x/A.tsx', line: 3, props: ['label'] },
    { component: 'PanelField', file: 'app/x/B.tsx', line: 4, props: ['label'] },
  ],
  routes: [
    { path: 'admin/a', office: 'admin', file: 'app/x/A.tsx' },
    { path: 'admin/b', office: 'admin', file: 'app/x/B.tsx' },
    { path: 'admin/c', office: 'admin', file: 'app/x/C.tsx' },
    { path: 'admin/$missingId', office: 'admin', file: 'app/x/D.tsx' },
  ],
  routeFiles: {
    'admin/a': ['app/x/A.tsx'],
    'admin/b': ['app/x/B.tsx', 'app/x/A.tsx'],
    'admin/c': ['app/x/C.tsx'],
  },
} as unknown as ScanOutput;

describe('healTasks', () => {
  it('writes one task per divergence from the story, with the story token', () => {
    const b = instance({ route: 'admin/b', styles: styles({ radius: '8px' }) });
    const b2 = instance({
      route: 'admin/b',
      viewport: 'mobile',
      width: 390,
      styles: styles({ radius: '8px' }),
    });
    const tasks = healTasks(
      'PanelField',
      [instance({ route: 'admin/a' }), b, b2],
      [story()],
      scan,
      meta
    );
    expect(tasks).toEqual([
      [
        'heal: PanelField · app/x/A.tsx:3 or app/x/B.tsx:4 · 8px → --gv-radius-1 · mode redesign',
        'why: audit, radius 8px on /admin/b (1280, 390), story components-forms-panelfield--default 4px',
        'check: story components-forms-panelfield--default, routes /admin/b',
      ].join('\n'),
    ]);
  });

  it('matches colours written as hex in the token source', () => {
    const a = instance({
      route: 'admin/a',
      styles: styles({ color: 'rgb(1, 1, 1)' }),
    });
    const [task] = healTasks('PanelField', [a], [story()], scan, meta);
    expect(task.split('\n')[0]).toBe(
      'heal: PanelField · app/x/A.tsx:3 · rgb(1, 1, 1) → --gv-text-primary · mode redesign'
    );
  });

  it('falls back to the most common value when no story was captured', () => {
    const tasks = healTasks(
      'PanelField',
      [
        instance({ route: 'admin/a' }),
        instance({ route: 'admin/c' }),
        instance({ route: 'admin/b', styles: styles({ padding: '6px' }) }),
      ],
      [],
      scan,
      meta
    );
    expect(tasks).toEqual([
      [
        'heal: PanelField · app/x/A.tsx:3 or app/x/B.tsx:4 · 6px → --gv-space-2 · mode redesign',
        'why: audit, padding 6px on /admin/b (1280), most instances 8px',
        'check: story (none), routes /admin/b',
      ].join('\n'),
    ]);
  });
});

describe('planVisits', () => {
  const fixture = {
    hosts: { after: '', before: '' },
    params: { projectId: 'p1' },
    paths: {},
    locale: 'en',
  };

  it('resolves the component routes and lists the ones it cannot fill', () => {
    const s = {
      ...scan,
      components: [
        {
          component: 'PanelField',
          file: 'x',
          routes: ['admin/a', 'admin/$missingId'],
        },
      ],
    } as unknown as ScanOutput;
    expect(planVisits(s, 'PanelField', fixture, 'https://host/')).toEqual({
      visits: [
        { route: 'admin/a', office: 'admin', url: 'https://host/en/admin/a' },
      ],
      notReached: [
        { route: 'admin/$missingId', reason: 'no fixture value for missingId' },
      ],
    });
  });

  it('filters routes by substring', () => {
    expect(
      planVisits(scan, 'PanelField', fixture, 'https://host', [
        '/b',
      ]).visits.map((v) => v.route)
    ).toEqual(['admin/b']);
  });
});

describe('findStory', () => {
  const index = {
    entries: {
      'components-forms-panelfield--with-hint': {
        id: 'components-forms-panelfield--with-hint',
        title: 'Components/Forms/PanelField',
        name: 'With hint',
        type: 'story',
        importPath:
          './app/component-library/components/PanelField/PanelField.stories.tsx',
      },
      'components-forms-panelfield--default': {
        id: 'components-forms-panelfield--default',
        title: 'Components/Forms/PanelField',
        name: 'Default',
        type: 'story',
        importPath:
          './app/component-library/components/PanelField/PanelField.stories.tsx',
      },
      'components-forms-panelfield--docs': {
        id: 'components-forms-panelfield--docs',
        title: 'Components/Forms/PanelField',
        name: 'Docs',
        type: 'docs',
        importPath:
          './app/component-library/components/PanelField/PanelField.stories.tsx',
      },
    },
  };

  it('picks the Default story by title', () => {
    expect(findStory(index, 'PanelField')).toBe(
      'components-forms-panelfield--default'
    );
  });

  it('falls back to the first story, and to nothing', () => {
    const { 'components-forms-panelfield--default': _d, ...rest } =
      index.entries;
    expect(findStory({ entries: rest }, 'PanelField')).toBe(
      'components-forms-panelfield--with-hint'
    );
    expect(findStory(index, 'Button')).toBeUndefined();
  });
});

describe('parseArgs', () => {
  it('reads the flags and keeps defaults', () => {
    const a = parseArgs(
      [
        '--component',
        'OptionList',
        '--host',
        'https://h/',
        '--state',
        's.json',
        '--open',
        'button.x',
        '--route',
        'ideas',
      ],
      { defaultHost: 'https://d', defaultState: '/home/u/state.json' }
    );
    expect(a).toEqual({
      component: 'OptionList',
      host: 'https://h',
      storybook: 'https://h/storybook',
      state: 's.json',
      open: ['button.x'],
      routes: ['ideas'],
      maxTriggers: 12,
    });
    expect(
      parseArgs(['--component', 'X'], {
        defaultHost: 'https://d',
        defaultState: 'st',
      })
    ).toMatchObject({
      host: 'https://d',
      storybook: 'https://d/storybook',
      state: 'st',
    });
  });

  it('throws on a missing component or an unknown flag', () => {
    expect(() =>
      parseArgs([], { defaultHost: 'h', defaultState: 's' })
    ).toThrow('--component');
    expect(() =>
      parseArgs(['--component', 'X', '--nope'], {
        defaultHost: 'h',
        defaultState: 's',
      })
    ).toThrow('unknown argument --nope');
  });
});

describe('codegenCommand', () => {
  it('prints the command that saves a session for the host', () => {
    expect(codegenCommand('/s/admin.json', 'https://host')).toBe(
      'npx playwright codegen --save-storage=/s/admin.json https://host/en/sign-in'
    );
  });
});

describe('auditIndex', () => {
  it('adds or replaces the component entry and keeps the others', () => {
    const before = {
      generatedAt: 'old',
      components: { Button: { file: 'audits/Button.json' } },
    };
    const report = {
      component: 'PanelField',
      generatedAt: '2026-10-23T00:00:00.000Z',
      host: 'https://host',
      instances: [instance(), instance({ error: 'login' })],
      notReached: [{ route: 'r', reason: 'x' }],
      inconsistencies: ['a'],
      healTasks: ['t', 'u'],
    };
    const next = auditIndex(before, report);
    expect(next).toEqual({
      generatedAt: '2026-10-23T00:00:00.000Z',
      components: {
        Button: { file: 'audits/Button.json' },
        PanelField: {
          file: 'audits/PanelField.json',
          generatedAt: '2026-10-23T00:00:00.000Z',
          host: 'https://host',
          instances: 1,
          failed: 1,
          routes: 1,
          notReached: 1,
          inconsistencies: 1,
          healTasks: 2,
        },
      },
    });
    expect(
      Object.keys(
        auditIndex(undefined, { ...report, component: 'X' }).components
      )
    ).toEqual(['X']);
  });
});
