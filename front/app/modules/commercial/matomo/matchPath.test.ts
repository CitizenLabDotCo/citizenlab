import { getAllPathsFromRoutes } from './matchPath';

describe('getAllPathsFromRoutes', () => {
  it('should return all paths from routes', () => {
    const mockRoutes = {
      path: '/:locale',
      children: [
        {
          path: 'sign-in',
        },
        {
          path: 'sign-up',
        },
        {
          path: 'invite',
        },
        {
          path: 'complete-signup',
        },
        {
          path: 'admin',
          children: [
            {
              path: 'dashboard',
              children: [
                {
                  path: 'users',
                },
              ],
            },
          ],
        },
      ],
    };

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
