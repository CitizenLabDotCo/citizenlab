import loadAndRender from 'utils/loadAndRender';

export default () => ({
  path: 'pages',
  getComponent: loadAndRender(import('./')),
  indexRoute: {
    getComponent: loadAndRender(import('./All')),
  },
  childRoutes: [
    {
      path: 'new',
      getComponent: loadAndRender(import('./Edit')),
    },
    {
      path: ':pageId/editor/:locale',
      getComponent: loadAndRender(import('./New')),
    },
    {
      path: ':pageId',
      getComponent: loadAndRender(import('./BodyEditor')),
    },
  ],
});
