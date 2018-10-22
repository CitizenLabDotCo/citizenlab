import loadAndRender from 'utils/loadAndRender';

export default () => ({
  path: '',
  name: 'Admin dashboard',
  getComponent: loadAndRender(import('./')),
  indexRoute: {
    getComponent: loadAndRender(import('./summary')),
  },
  childRoutes: [
    {
      path: 'dashboard-summary',
      getComponent: loadAndRender(import('./summary')),
    },
    {
      path: 'dashboard-users',
      getComponent: loadAndRender(import('./users')),
    },
    {
      path: 'dashboard-acquisition',
      getComponent: loadAndRender(import('./acquisition')),
    },
  ],
});
