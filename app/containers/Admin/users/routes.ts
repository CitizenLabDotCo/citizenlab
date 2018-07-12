import loadAndRender from 'utils/loadAndRender';

export default () => ({
  path: 'users',
  name: 'admin users',
  getComponent: loadAndRender(import('containers/Admin/users')),
  indexRoute: {
    getComponent: loadAndRender(import('containers/Admin/users/AllUsers')),
  },
  childRoutes: [
    {
      path: '/:locale/admin/users/:groupId',
      getComponent: loadAndRender(import('containers/Admin/users/UsersGroup')),
    },
  ],
});
