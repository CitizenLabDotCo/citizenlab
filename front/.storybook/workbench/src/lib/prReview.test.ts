import type { ScanOutput } from './data';
import {
  designChanges,
  forOrigin,
  isPlatformFile,
  liveParams,
  pictures,
  plainSubject,
  prOfHost,
  routeLinks,
  byStory,
  agentText,
  areasOfProps,
  areasOfText,
  scaleText,
} from './prReview';
import { ChangeCommit, DesignChanges, normaliseFixture } from './review';

const DROPDOWN =
  'front/app/containers/Admin/projects/project/backofficeRedesign/Header/HeaderDropdown.tsx';
const STORY =
  'front/app/containers/Admin/projects/project/backofficeRedesign/Header/HeaderDropdown.stories.tsx';

const commit = (
  sha: string,
  kind: ChangeCommit['kind'],
  files: string[],
  subject = `design-system(${kind}): ${sha}`
): ChangeCommit => ({ sha, subject, body: '', files, kind });

// design-changes.json lists commits newest first (git log).
const changes = (commits: ChangeCommit[]): DesignChanges => ({
  generatedAt: '2026-10-27T12:00:00Z',
  base: 'b0',
  baseRef: 'origin/design-system/workbench',
  head: commits[0]?.sha ?? 'b0',
  repoUrl: 'https://github.com/CitizenLabDotCo/citizenlab',
  commits,
  tokenChanges: [],
  warnings: [],
});

describe('prOfHost', () => {
  it('reads the PR of an epic host', () => {
    expect(prOfHost('pr-15059.epic.hq.govocal.com')).toBe(15059);
  });
  it('is undefined anywhere else', () => {
    [
      'localhost',
      'epic.hq.govocal.com',
      'pr-15059.epic.hq.govocal.com.evil.test',
      'pr-x.epic.hq.govocal.com',
      'demo.stg.govocal.com',
    ].forEach((h) => expect(prOfHost(h)).toBeUndefined());
  });
});

describe('isPlatformFile', () => {
  it('is app code, not stories, tests or mocks', () => {
    expect(isPlatformFile(DROPDOWN)).toBe(true);
    expect(isPlatformFile(STORY)).toBe(false);
    expect(isPlatformFile('front/app/utils/x.test.ts')).toBe(false);
    expect(isPlatformFile('front/app/api/x/__mocks__/a.ts')).toBe(false);
    expect(isPlatformFile('front/.storybook/workbench/src/App.tsx')).toBe(
      false
    );
    [
      'front/app/component-library/components/Box/a11y.json',
      'front/app/design-system/tokens/tokens.css',
      'front/app/utils/storybook/getOrigin.ts',
    ].forEach((f) => expect(isPlatformFile(f)).toBe(false));
  });
});

describe('designChanges', () => {
  it('keeps design commits that still change platform code, oldest first', () => {
    const list = changes([
      commit('c4', 'design', [DROPDOWN]),
      commit('c3', 'heal', [DROPDOWN]),
      commit('c2', 'story', [STORY]),
      commit('c1', 'heal', [DROPDOWN]),
      commit('c0', 'other', [DROPDOWN]),
    ]);
    expect(designChanges(list).map((c) => c.sha)).toEqual(['c1', 'c3', 'c4']);
  });
  it('drops commits whose files are only stories or tokens, or were all reverted', () => {
    const list = changes([
      commit('h2', 'heal', []),
      commit('h1', 'heal', [STORY]),
      commit('t1', 'token', [
        'front/app/design-system/tokens/tokens.source.json',
      ]),
      commit('l1', 'lift', [
        'front/app/component-library/components/PanelField/index.tsx',
      ]),
    ]);
    expect(designChanges(list).map((c) => c.sha)).toEqual(['l1']);
  });
  it('is empty without a change list', () => {
    expect(designChanges(undefined)).toEqual([]);
  });
});

describe('pictures', () => {
  it('are one level up, per commit', () => {
    expect(pictures('abc123')).toEqual({
      before: '../changes/abc123/before.png',
      after: '../changes/abc123/after.png',
    });
  });
});

const fixture = normaliseFixture({
  params: { projectId: 'p-15027', slug: 'old-slug' },
  paths: { 'ideas/$slug': { slug: 'idea-slug' } },
  locale: 'en',
  source: { host: 'https://pr-15027.epic.hq.govocal.com' },
});

describe('forOrigin', () => {
  it('keeps the fixture on its own host', () => {
    expect(
      forOrigin(fixture, 'https://pr-15027.epic.hq.govocal.com', {
        projectId: 'live',
      })
    ).toBe(fixture);
  });
  it('uses only the live params on another host', () => {
    const f = forOrigin(fixture, 'https://pr-15059.epic.hq.govocal.com', {
      projectId: 'p-15059',
    });
    expect(f.params).toEqual({ projectId: 'p-15059' });
    expect(f.paths).toEqual({});
    expect(f.locale).toBe('en');
  });
});

describe('routeLinks', () => {
  const scan = {
    routes: [],
    findings: [],
    routeFiles: {
      'admin/projects/$projectId/general': [
        'app/containers/Admin/projects/project/backofficeRedesign/Header/HeaderDropdown.tsx',
      ],
      'admin/projects/$projectId': [
        'app/containers/Admin/projects/project/backofficeRedesign/Header/HeaderDropdown.tsx',
      ],
      'admin/projects/$projectId/phases/$phaseId/setup': [
        'app/containers/Admin/projects/project/backofficeRedesign/Header/HeaderDropdown.tsx',
      ],
      'projects/$slug': ['app/containers/ProjectsShowPage/index.tsx'],
    },
  } as unknown as ScanOutput;
  it('lists the pages a change reaches, shortest first, with real URLs', () => {
    const f = forOrigin(fixture, 'https://pr-1.epic.hq.govocal.com', {
      projectId: 'p1',
    });
    expect(
      routeLinks(
        scan,
        commit('h1', 'heal', [DROPDOWN]),
        f,
        'https://pr-1.epic.hq.govocal.com'
      )
    ).toEqual([
      {
        path: 'admin/projects/$projectId',
        url: 'https://pr-1.epic.hq.govocal.com/en/admin/projects/p1',
      },
      {
        path: 'admin/projects/$projectId/general',
        url: 'https://pr-1.epic.hq.govocal.com/en/admin/projects/p1/general',
      },
      { path: 'admin/projects/$projectId/phases/$phaseId/setup', url: '' },
    ]);
  });
  it('reaches nothing for a commit that is not a design change', () => {
    expect(
      routeLinks(scan, commit('s1', 'story', [STORY]), fixture, 'https://x')
    ).toEqual([]);
  });
});

const respond = (body: unknown, status = 200) =>
  Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  } as Response);

describe('liveParams', () => {
  it('reads a project, its slug and its first phase from this platform', async () => {
    const asked: string[] = [];
    const fetcher = ((url: string) => {
      asked.push(url);
      if (url.endsWith('/web_api/v1/projects?page[size]=1')) {
        return respond({
          data: [{ id: 'p1', attributes: { slug: 'my-project' } }],
        });
      }
      if (url.endsWith('/web_api/v1/projects/p1/phases')) {
        return respond({ data: [{ id: 'ph1' }, { id: 'ph2' }] });
      }
      return respond({}, 404);
    }) as unknown as typeof fetch;
    expect(
      await liveParams('https://pr-1.epic.hq.govocal.com', fetcher)
    ).toEqual({ projectId: 'p1', slug: 'my-project', phaseId: 'ph1' });
    expect(asked[0]).toBe(
      'https://pr-1.epic.hq.govocal.com/web_api/v1/projects?page[size]=1'
    );
  });
  it('is empty when the platform does not answer', async () => {
    const fetcher = (() =>
      Promise.reject(new Error('offline'))) as unknown as typeof fetch;
    expect(await liveParams('https://x', fetcher)).toEqual({});
  });
});

describe('plainSubject', () => {
  it('drops the area and the AI tag', () => {
    expect(
      plainSubject(
        'design-system(heal): HeaderDropdown 8px → --gv-radius-2 [AI-assisted]'
      )
    ).toBe('HeaderDropdown 8px → --gv-radius-2');
  });
});

describe('byStory', () => {
  it('groups edits per story, in the order stories were first edited', () => {
    const e = (id: string, storyId: string) => ({ id, storyId });
    expect(
      byStory([e('1', 'b'), e('2', 'a'), e('3', 'b')]).map(([s, list]) => [
        s,
        list.map((x) => x.id),
      ])
    ).toEqual([
      ['b', ['1', '3']],
      ['a', ['2']],
    ]);
  });
});

describe('agentText', () => {
  it('names the connected PR, then the tasks, then the token patch', () => {
    const text = agentText(15063, ['change: A', 'heal: B'], '+ x\n');
    expect(text.split('\n')[1]).toBe(
      'PR: #15063. Add the commits to its branch.'
    );
    expect(text).toContain(
      '\n\nchange: A\n\nheal: B\n\ntokens.source.json:\n+ x'
    );
  });
  it('asks for a new PR when none is connected, and leaves out an empty patch', () => {
    const text = agentText(undefined, ['change: A'], '');
    expect(text).toContain('PR: a new one');
    expect(text).not.toContain('tokens.source.json');
    expect(text).not.toContain('—');
  });
});

describe('what a change touches', () => {
  it('reads areas from CSS properties', () => {
    expect(areasOfProps(['background-color'])).toEqual(['Colour']);
    expect(
      areasOfProps(['border-top-left-radius', 'padding-top', 'transition'])
    ).toEqual(['Radius', 'Spacing', 'Animation']);
    expect(areasOfProps(['display'])).toEqual([]);
  });
  it('reads areas from a commit subject', () => {
    expect(
      areasOfText('HeaderDropdown radius 8px → 12px (--gv-radius-3)')
    ).toEqual(['Radius']);
    expect(areasOfText('Badge #E52516 → --gv-error')).toEqual(['Colour']);
    expect(areasOfText('Card 16px → --gv-space-4')).toEqual(['Spacing']);
  });
  it('says how far it reaches', () => {
    expect(scaleText('Button', 304, 58)).toBe(
      'Button · used in 304 places · on 58 pages'
    );
    expect(scaleText('HeaderDropdown', 1, 0, true)).toBe(
      'HeaderDropdown · used in 1 place · on every page'
    );
    expect(scaleText(undefined, undefined, 0)).toBe('');
  });
});
