import loadAndRender from 'utils/loadAndRender';

export default () => ({
  path: '/admin/users',
  name: 'admin users',
  getComponent: loadAndRender(import('containers/Admin/users')),
  indexRoute: {
    getComponent: loadAndRender(import('containers/Admin/users/AllUsers')),
  },
  childRoutes: [
    {
      path: '/admin/users/:groupId',
      getComponent: loadAndRender(import('containers/Admin/users/UsersGroup')),
    },
  ],
});
