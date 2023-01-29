import { getAllPathsFromRoutes } from './matchPath';
import { mockRoutes } from './mockRoutes.mock';

describe('getAllPathsFromRoutes', () => {
  it('should return all paths from routes', () => {
    const expected = [
      '/:locale',
      '/:locale/sign-in',
      '/:locale/sign-up',
      '/:locale/invite',
      '/:locale/complete-signup',
      '/:locale/admin',
      '/:locale/admin/dashboard',
      '/:locale/admin/dashboard/users',
    ];
    expect(getAllPathsFromRoutes(mockRoutes)).toEqual(expected);
  });
});
