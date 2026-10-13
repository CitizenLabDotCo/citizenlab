import { getAdminArea, getProjectPage } from './utils';

jest.mock('utils/getRoutePattern', () => ({
  getRoutePattern: (path: string) =>
    ({
      '/en/admin/projects/p1/phases/ph1/insights':
        '/:locale/admin/projects/:projectId/phases/:phaseId/insights',
      '/en/admin/projects/folders/f1/settings':
        '/:locale/admin/projects/folders/:folderId/settings',
      '/en/admin/dashboard/overview': '/:locale/admin/dashboard/overview',
      '/en/admin/projects/p1/general':
        '/:locale/admin/projects/:projectId/general/',
      '/en/projects/my-project': '/:locale/projects/:slug',
    }[path]),
}));

describe('getProjectPage', () => {
  it('returns the project and route pattern of a project back office page', () => {
    expect(getProjectPage('/en/admin/projects/p1/phases/ph1/insights')).toEqual(
      {
        projectId: 'p1',
        adminArea:
          '/:locale/admin/projects/:projectId/phases/:phaseId/insights',
      }
    );
  });

  it('returns null outside a project', () => {
    expect(getProjectPage('/en/admin/projects/folders/f1/settings')).toBeNull();
    expect(getProjectPage('/en/admin/dashboard/overview')).toBeNull();
    expect(getProjectPage('/en/projects/my-project')).toBeNull();
  });
});

describe('getAdminArea', () => {
  it('drops the trailing slash of index routes', () => {
    expect(getAdminArea('/en/admin/projects/p1/general')).toBe(
      '/:locale/admin/projects/:projectId/general'
    );
  });

  it('only returns back office route patterns', () => {
    expect(getAdminArea('/en/admin/dashboard/overview')).toBe(
      '/:locale/admin/dashboard/overview'
    );
    expect(getAdminArea('/en/projects/my-project')).toBeUndefined();
  });
});
