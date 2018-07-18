import loadAndRender from 'utils/loadAndRender';

export default () => ({
  path: 'campaigns',
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
      path: ':campaignId/edit',
      getComponent: loadAndRender(import('./Edit')),
    },
    {
      path: ':campaignId',
      getComponent: loadAndRender(import('./Show')),
    },
  ],
});
