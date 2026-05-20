jest.mock('routes', () => ({
  router: {
    getMatchedRoutes: jest.fn((pathname: string) => {
      const routes: Record<string, string> = {
        '/en': '/$locale',
        '/en/projects': '/$locale/projects',
        '/en/ideas/my-idea': '/$locale/ideas/$slug',
        '/en/projects/my-project/ideas/new':
          '/$locale/projects/$slug/ideas/new',
      };
      const fullPath = routes[pathname];
      return {
        foundRoute: fullPath ? { fullPath } : undefined,
        matchedRoutes: [],
        routeParams: {},
        parsedParams: undefined,
      };
    }),
  },
}));

import { getRoutePattern } from './getRoutePattern';

describe('getRoutePattern', () => {
  it('returns the route pattern for a matching path with :param format', () => {
    expect(getRoutePattern('/en/ideas/my-idea')).toBe('/:locale/ideas/:slug');
  });

  it('returns the route pattern for a simple locale path', () => {
    expect(getRoutePattern('/en')).toBe('/:locale');
  });

  it('returns the route pattern for a path with multiple params', () => {
    expect(getRoutePattern('/en/projects/my-project/ideas/new')).toBe(
      '/:locale/projects/:slug/ideas/new'
    );
  });

  it('returns undefined for a non-matching path', () => {
    expect(getRoutePattern('/nonexistent/path')).toBeUndefined();
  });

  it('normalizes $param to :param format', () => {
    const result = getRoutePattern('/en/projects');
    expect(result).toBe('/:locale/projects');
    expect(result).not.toContain('$');
  });
});
