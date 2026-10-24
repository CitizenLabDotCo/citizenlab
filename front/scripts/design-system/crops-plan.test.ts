import { cropSlug, openable, planCrops } from './crops-plan';

const c = (component: string, usageCount: number, routes: string[]) => ({
  component,
  file: `app/components/UI/${component}/index.tsx`,
  usageCount,
  routes,
});

describe('planCrops', () => {
  it('pictures components with no story on routes it can open, shared routes first', () => {
    const plan = planCrops(
      [
        c('Modal', 9, ['projects', 'admin/users', '']),
        c('Warning', 5, ['', 'ideas/$slug']),
        c('Story', 50, ['']),
        c('AdminOnly', 3, ['admin/x']),
      ],
      new Set(['app/components/UI/Story/index.tsx']),
      { session: false, perComponent: 2 }
    );
    expect([...plan.routes]).toEqual([
      ['', ['Modal', 'Warning']],
      ['projects', ['Modal']],
    ]);
    expect(plan.unreachable).toEqual(['AdminOnly']);
  });

  it('opens the admin with a session, never a route with ids', () => {
    expect(openable('admin/users', true)).toBe(true);
    expect(openable('admin/users', false)).toBe(false);
    expect(openable('projects/$slug', true)).toBe(false);
  });

  it('names the picture after the component', () => {
    expect(cropSlug('UI/Error')).toBe('UI-Error');
  });
});
