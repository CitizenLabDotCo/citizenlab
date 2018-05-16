import loadAndRender from 'utils/loadAndRender';

export default () => ({
  path: '/admin/groups',
  name: 'admin groups',
  getComponent: loadAndRender(import('./')),
  indexRoute: {
    name: 'admin groups index',
    getComponent: loadAndRender(import('./all')),
  },
  childRoutes: [
    {
      path: '/admin/groups/edit/:groupId',
      name: 'admin groups single group',
      getComponent: loadAndRender(import('./edit')),
    },
    {
      path: '/admin/groups/poc-conditions',
      getComponent: loadAndRender(import('components/admin/UserFilterConditions/TestWrapper')),
    },
  ],
});
