import type { ScanOutput, StoryIndex } from './data';
import { controlOf, controlsOf } from './preview';
import {
  ALL,
  buildGroups,
  filterGroups,
  groupOfStory,
  officeOf,
  sectionOf,
} from './stories';

const entry = (
  id: string,
  title: string,
  name: string,
  extra: Record<string, unknown> = {}
) => ({
  id,
  title,
  name,
  exportName: name.replace(/\s/g, ''),
  importPath: `./${title}.stories.tsx`,
  type: 'story',
  tags: ['dev'],
  ...extra,
});

const index: StoryIndex = {
  entries: Object.fromEntries(
    [
      entry('b--primary', 'Components/Actions/Button', 'Primary', {
        componentPath: './app/component-library/components/Button/index.tsx',
        tags: ['dev', 'shared'],
      }),
      entry('b--rtl', 'Components/Actions/Button', 'RTL'),
      entry('b--default', 'Components/Actions/Button', 'Default'),
      entry('b--hover', 'Components/Actions/Button', 'Hover'),
      entry('a--basic', 'Components/Accordion', 'Basic'),
      entry('card--x', 'Cards/IdeaCard', 'Default'),
      entry('p--form', 'Patterns/Forms/Sign in', 'Default'),
    ].map((e) => [e.id, e])
  ),
};

const score = (component: string, file: string, routes: string[]) => ({
  component,
  file,
  score: 0.5,
  counts: {} as never,
  usageCount: 3,
  routes,
  status: 'partly' as const,
});

const scan = {
  components: [
    score('Button', 'app/component-library/components/Button/index.tsx', [
      'admin/x',
    ]),
    score('Accordion', 'elsewhere/Accordion.tsx', ['admin/y', 'projects']),
  ],
} as unknown as ScanOutput;

describe('buildGroups', () => {
  const groups = buildGroups(index, scan);
  const button = groups.find((g) => g.name === 'Button');

  it('makes one group per title, sorted by name', () => {
    expect(groups.map((g) => g.name)).toEqual([
      'Accordion',
      'Button',
      'IdeaCard',
      'Sign in',
    ]);
  });

  it('puts states first in convention order, then variants', () => {
    expect(button?.stories.map((s) => s.exportName)).toEqual([
      'Default',
      'Hover',
      'RTL',
      'Primary',
    ]);
    expect(button?.stories.map((s) => s.state)).toEqual([
      true,
      true,
      true,
      false,
    ]);
    expect(button?.defaultId).toBe('b--default');
  });

  it('reads section and category from the title', () => {
    expect(button?.section).toBe('components');
    expect(button?.category).toBe('Actions');
    expect(groups.find((g) => g.name === 'IdeaCard')?.section).toBeNull();
    expect(groups.find((g) => g.name === 'IdeaCard')?.category).toBe('Cards');
    expect(groups.find((g) => g.name === 'Sign in')?.section).toBe('patterns');
  });

  it('joins the scan by component file, then by name', () => {
    expect(button?.status).toBe('partly');
    expect(button?.file).toBe(
      'app/component-library/components/Button/index.tsx'
    );
    const acc = groups.find((g) => g.name === 'Accordion');
    expect(acc?.score?.file).toBe('elsewhere/Accordion.tsx');
    expect(acc?.defaultId).toBe('a--basic');
    expect(groups.find((g) => g.name === 'IdeaCard')?.status).toBe('unscanned');
  });

  it('takes the office from tags, else from routes', () => {
    expect(button?.office).toBe('shared');
    expect(groups.find((g) => g.name === 'Accordion')?.office).toBe('shared');
    expect(officeOf([], ['admin/x'])).toBe('bo');
    expect(officeOf([], ['admin', 'projects'])).toBe('shared');
    expect(officeOf([], ['projects'])).toBe('fo');
    expect(officeOf([], [])).toBe('unknown');
    expect(officeOf(['fo'], ['admin'])).toBe('fo');
  });

  it('finds the group of a story', () => {
    expect(groupOfStory(groups, 'b--rtl')?.name).toBe('Button');
    expect(groupOfStory(groups, 'nope')).toBeUndefined();
  });

  it('filters by office, status and text', () => {
    expect(
      filterGroups(groups, { ...ALL, query: 'act' }).map((g) => g.name)
    ).toEqual(['Button']);
    expect(
      filterGroups(groups, { ...ALL, office: 'bo' }).map((g) => g.name)
    ).toEqual(['Accordion', 'Button']);
    expect(
      filterGroups(groups, { ...ALL, status: 'unscanned' }).map((g) => g.name)
    ).toEqual(['IdeaCard', 'Sign in']);
  });

  it('knows the sections', () => {
    expect(sectionOf('Pages/Home')).toBe('pages');
    expect(sectionOf('HomepageBuilder/Spotlight')).toBeNull();
  });
});

describe('controlOf', () => {
  it('maps control types', () => {
    expect(controlOf('a', { control: { type: 'boolean' } })?.kind).toBe(
      'boolean'
    );
    expect(controlOf('a', { control: { type: 'color' } })).toEqual({
      name: 'a',
      kind: 'string',
      colour: true,
      description: undefined,
    });
    expect(controlOf('a', { control: { type: 'range' } })?.kind).toBe('number');
    expect(
      controlOf('a', { control: { type: 'radio' }, options: ['s', 'm'] })
    ).toEqual({
      name: 'a',
      kind: 'select',
      options: [
        { label: 's', value: 's' },
        { label: 'm', value: 'm' },
      ],
      description: undefined,
    });
  });

  it('falls back to the TypeScript type', () => {
    expect(controlOf('a', { type: { name: 'boolean' } })?.kind).toBe('boolean');
    expect(
      controlOf('a', { type: { name: 'enum', value: ['x', 'y'] } })
    ).toMatchObject({
      kind: 'select',
      options: [{ value: 'x' }, { value: 'y' }],
    });
  });

  it('keeps number and boolean options typed', () => {
    expect(
      controlOf('a', { control: { type: 'select' }, options: [1, 2, true] })
    ).toMatchObject({
      options: [
        { label: '1', value: 1 },
        { label: '2', value: 2 },
        { label: 'true', value: true },
      ],
    });
  });

  it('skips what needs code', () => {
    expect(controlOf('a', { control: { type: 'object' } })).toBeNull();
    expect(controlOf('a', { type: { name: 'function' } })).toBeNull();
    expect(controlOf('a', { control: false })).toBeNull();
    expect(controlOf('a', { control: { type: 'select' } })).toBeNull();
  });

  it('lists set args first and counts the skipped ones', () => {
    const { controls, skipped } = controlsOf({
      id: 's',
      args: { b: true },
      argTypes: {
        a: { control: { type: 'text' } },
        b: { control: { type: 'boolean' } },
        c: { control: { type: 'object' } },
        children: { control: { type: 'object' }, type: { name: 'other' } },
      },
    });
    expect(controls.map((c) => c.name)).toEqual(['b', 'a']);
    expect(skipped).toBe(2);
  });

  it('gives a node prop that holds text a text input', () => {
    const { controls } = controlsOf({
      id: 's',
      args: { children: 'Save' },
      argTypes: { children: { control: { type: 'object' } } },
    });
    expect(controls).toEqual([
      { name: 'children', kind: 'string', colour: false },
    ]);
  });
});
