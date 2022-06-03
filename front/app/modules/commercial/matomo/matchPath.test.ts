import { getAllPathsFromRoutes } from './matchPath';

// current output on master:
// "/:locale"
// 1: "/:locale/sign-in"
// 2: "/:locale/sign-up"
// 3: "/:locale/invite"
// 4: "/:locale/complete-signup"
// 5: "/:locale/authentication-error"
// 6: "/:locale/site-map"
// 7: "/:locale/profile/edit"
// 8: "/:locale/profile/:userSlug"
// 9: "/:locale/ideas/edit/:ideaId"
// 10: "/:locale/ideas"
// 11: "/:locale/ideas/:slug"
// 12: "/:locale/initiatives"
// 13: "/:locale/initiatives/edit/:initiativeId"
// 14: "/:locale/initiatives/new"
// 15: "/:locale/initiatives/:slug"
// 16: "/:locale/projects/:slug/ideas/new"
// 17: "/:locale/admin"
// 18: "/:locale/admin/dashboard"
// 19: "/:locale/admin/dashboard/users"

describe('getAllPathsFromRoutes', () => {
  it('should return all paths from routes', () => {
    const mockRoutes = {
      path: '/:locale',
      indexRoute: {},
      childRoutes: [
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
          indexRoute: {},
          childRoutes: [
            {
              path: 'dashboard',
              indexRoute: {},
              childRoutes: [
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
