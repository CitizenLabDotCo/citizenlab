export const mockRoutes = {
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
