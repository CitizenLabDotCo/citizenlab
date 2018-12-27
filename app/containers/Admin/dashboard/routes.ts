import loadAndRender from 'utils/loadAndRender';

export default () => ({
  name: 'Admin dashboard',
  path: 'dashboard',
  getComponent: loadAndRender(import('./')),
  indexRoute: {
    getComponent: loadAndRender(import('./summary')),
  },
  childRoutes: [
    {
      path: 'users',
      getComponent: loadAndRender(import('./users')),
    },
  /* TODO {
      path: 'dashboard-acquisition',
      getComponent: loadAndRender(import('./acquisition')),
    },*/
    {
      path: 'map',
      getComponent: loadAndRender(import('./map')),
    }
  ],
});
