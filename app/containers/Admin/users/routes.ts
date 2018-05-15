import loadAndRender from 'utils/loadAndRender';

export default () => ({
  path: '/admin/users',
  name: 'admin users',
  getComponent: loadAndRender(import('containers/Admin/users')),
  indexRoute: {
    getComponent: loadAndRender(import('containers/Admin/users/registered')),
  },
  childRoutes: [
    {
      path: 'registered',
      getComponent: loadAndRender(import('containers/Admin/users/registered')),
    },
    {
      path: 'invitations',
      getComponent: loadAndRender(import('containers/Admin/users/invitations')),
    },
  ],
});
