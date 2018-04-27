import loadAndRender from 'utils/loadAndRender';

export default () => ({
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
      path: ':customFieldId',
      getComponent: loadAndRender(import('./Edit')),
      childRoutes: [
        {
          path: 'general',
          getComponent: loadAndRender(import('./Edit/General')),
        },
        {
          path: 'options',
          getComponent: loadAndRender(import('./Edit/Options')),
        },
      ],
    },
  ],
});
