import loadAndRender from 'utils/loadAndRender';

export default () => ({
  name: 'Admin dashboard',
  getComponent: loadAndRender(import('./')),
  indexRoute: {
    getComponent: loadAndRender(import('./summary')),
  },
  childRoutes: [
    {
      path: '',
      getComponent: loadAndRender(import('./summary')),
    },
    {
      path: 'dashboard-users',
      getComponent: loadAndRender(import('./users')),
    },
  /* TODO {
      path: 'dashboard-acquisition',
      getComponent: loadAndRender(import('./acquisition')),
    },*/
  ],
});
