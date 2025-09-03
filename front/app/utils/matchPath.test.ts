import { mockRoutes } from './__mocks__/mockRoutes.mock';
import { getAllPathsFromRoutes } from './matchPath';

describe('getAllPathsFromRoutes', () => {
  it('should return all paths from routes', () => {
    const expected = [
      '/:locale',
      '/:locale/sign-in',
      '/:locale/sign-up',
      '/:locale/invite',
      '/:locale/admin',
      '/:locale/admin/dashboard',
      '/:locale/admin/dashboard/users',
    ];
    expect(getAllPathsFromRoutes(mockRoutes)).toEqual(expected);
  });
});
