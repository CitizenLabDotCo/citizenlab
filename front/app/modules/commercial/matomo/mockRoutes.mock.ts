export const mockRoutes = {
  path: '/:locale',
  children: [
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
