import { buildInUse, cropSlug, filterInUse } from './inUse';

import type { ComponentScore } from './data';
import type { StoryGroup } from './stories';

const comp = (
  component: string,
  usageCount: number,
  routes: string[] = []
): ComponentScore => ({
  component,
  file: `app/components/${component}/index.tsx`,
  score: 80,
  counts: {} as ComponentScore['counts'],
  usageCount,
  routes,
  status: 'partly',
});

const group = (name: string, file?: string): StoryGroup => ({
  title: `Components/${name}`,
  name,
  category: '',
  section: 'components',
  stories: [
    {
      id: `${name}--default`,
      name: 'Default',
      exportName: 'Default',
      state: true,
    },
  ],
  defaultId: `${name}--default`,
  file,
  office: 'shared',
  status: 'partly',
  redesigned: false,
  area: '',
});

describe('buildInUse', () => {
  it('lists used components, most used first, with their story or crop', () => {
    const rows = buildInUse(
      [
        comp('Tag', 3, ['admin']),
        comp('Box', 40),
        comp('Unused', 0),
        comp('Pill', 3),
      ],
      [group('Box', 'app/components/Box/index.tsx')],
      {
        Pill: {
          file: 'app/components/Pill/index.tsx',
          route: '',
          width: 80,
          height: 30,
        },
        Box: { file: 'x', route: '', width: 1, height: 1 },
      }
    );
    expect(rows.map((r) => r.name)).toEqual(['Box', 'Pill', 'Tag']);
    expect(rows[0].group?.name).toBe('Box');
    expect(rows[0].crop).toBeUndefined();
    expect(rows[1].crop?.width).toBe(80);
    expect(rows[2].office).toBe('bo');
  });

  it('matches a story by name when the file differs', () => {
    const [row] = buildInUse(
      [comp('Box', 1)],
      [group('Box', 'app/other.tsx')],
      {}
    );
    expect(row.group?.name).toBe('Box');
  });
});

describe('filterInUse', () => {
  it('filters by office (shared counts for both) and query', () => {
    const rows = buildInUse(
      [
        comp('Tag', 3, ['admin']),
        comp('Box', 4, ['admin', '']),
        comp('Pill', 2, ['']),
      ],
      [],
      {}
    );
    expect(
      filterInUse(rows, { office: 'bo', status: 'all', query: '' }).map(
        (r) => r.name
      )
    ).toEqual(['Box', 'Tag']);
    expect(
      filterInUse(rows, { office: 'all', status: 'all', query: 'pil' }).map(
        (r) => r.name
      )
    ).toEqual(['Pill']);
  });

  it('keeps only the redesign when asked: its folders or its stories', () => {
    const rows = buildInUse(
      [
        {
          ...comp('StepRow', 2, ['admin/projects']),
          file: 'app/containers/Admin/projects/project/backofficeRedesign/StepRow.tsx',
        },
        comp('Box', 9),
      ],
      [],
      {}
    );
    expect(
      filterInUse(rows, {
        office: 'all',
        status: 'all',
        query: '',
        set: 'redesigned',
      }).map((r) => r.name)
    ).toEqual(['StepRow']);
  });
});

it('cropSlug makes a file name', () => {
  expect(cropSlug('UI/Error')).toBe('UI-Error');
});
