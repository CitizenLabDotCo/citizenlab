import loadAndRender from 'utils/loadAndRender';

export default () => ({
  path: 'emails',
  getComponent: loadAndRender(import('./')),
  indexRoute: {
    getComponent: loadAndRender(import('./manual/All')),
  },
  childRoutes: [
    {
      path: 'manual',
      getComponent: loadAndRender(import('./manual/All')),
    },
    {
      path: 'manual/new',
      getComponent: loadAndRender(import('./manual/New')),
    },
    {
      path: 'manual/:campaignId/edit',
      getComponent: loadAndRender(import('./manual/Edit')),
    },
    {
      path: 'manual/:campaignId',
      getComponent: loadAndRender(import('./manual/Show')),
    },
    {
      path: 'automated',
      getComponent: loadAndRender(import('./automated')),
    },
  ],
});
