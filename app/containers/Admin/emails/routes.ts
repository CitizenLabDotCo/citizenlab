import loadAndRender from 'utils/loadAndRender';

export default () => ({
  path: 'emails',
  getComponent: loadAndRender(import('./')),
  indexRoute: {
    getComponent: loadAndRender(import('./custom/All')),
  },
  childRoutes: [
    {
      path: 'custom',
      getComponent: loadAndRender(import('./custom/All')),
    },
    {
      path: 'custom/new',
      getComponent: loadAndRender(import('./custom/New')),
    },
    {
      path: 'custom/:campaignId/edit',
      getComponent: loadAndRender(import('./custom/Edit')),
    },
    {
      path: 'custom/:campaignId',
      getComponent: loadAndRender(import('./custom/Show')),
    },
    {
      path: 'automated',
      getComponent: loadAndRender(import('./automated')),
    },
  ],
});
