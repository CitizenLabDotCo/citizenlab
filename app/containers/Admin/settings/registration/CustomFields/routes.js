// Helper function to load components as async chunks
// Explanation why the import must be static: see the warnings at the bottom of this section: https://webpack.js.org/api/module-methods/#import-
const loadAndRender = (importPromise) => (_nextState, cb) => {
  importPromise
  .then((Module) => cb(null, Module.default))
  .catch((e) => console.error(e)); // eslint-disable-line no-console
};

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
