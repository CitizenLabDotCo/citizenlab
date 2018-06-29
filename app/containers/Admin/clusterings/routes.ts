import loadAndRender from 'utils/loadAndRender';

export default () => ({
  path: 'clusterings',
  getComponent: loadAndRender(import('./')),
  indexRoute: {
    getComponent: loadAndRender(import('./All')),
  },
  childRoutes: [
    {
      path: 'new',
      getComponent: loadAndRender(import('./New')),
    },
    {
      path: ':clusteringId',
      getComponent: loadAndRender(import('./Edit')),
    },
  ],
});
