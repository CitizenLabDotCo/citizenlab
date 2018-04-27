import loadAndRender from 'utils/loadAndRender';

export default () => ({
  path: 'pages',
  getComponent: loadAndRender('./'),
  indexRoute: {
    getComponent: loadAndRender('./All'),
  },
  childRoutes: [
    {
      path: 'new',
      getComponent: loadAndRender('./Edit'),
    },
    {
      path: ':pageId/editor/:locale',
      getComponent: loadAndRender('./New'),
    },
    {
      path: ':pageId',
      getComponent: loadAndRender('./BodyEditor'),
    },
  ],
});
