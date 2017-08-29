// These are the pages you can go to.
// They are all wrapped in the App component, which should contain the navbar etc
// See http://blog.mxstbr.com/2016/01/react-apps-with-pages for more information
// about the code splitting business
const errorLoading = (err) => {
  console.error('Dynamic page loading failed', err); // eslint-disable-line no-console
};

const loadModule = (cb) => (componentModule) => {
  cb(null, componentModule.default);
};

export default (injectReducer) => ({
  path: '/admin/areas',
  name: 'ideasPage',
  getComponent(nextState, cb) {
    const importModules = Promise.all([
      import('resources/areas/reducer'),
      import('containers/Admin/areas'),
    ]);

    const renderRoute = loadModule(cb);

    importModules.then(([reducer, component]) => {
      injectReducer('adminAreas', reducer.default);
      renderRoute(component);
    });

    importModules.catch(errorLoading);
  },
  indexRoute: {
    name: 'admin areas index',
    getComponent(nextState, cb) {
      const importModules = Promise.all([
        import('containers/Admin/areas/views/all'),
      ]);

      const renderRoute = loadModule(cb);

      importModules.then(([component]) => {
        renderRoute(component);
      });

      importModules.catch(errorLoading);
    },
  },
  childRoutes: [
    {
      path: '/admin/areas/create',
      name: 'ideasPage',
      getComponent(nextState, cb) {
        const importModules = Promise.all([
          import('containers/Admin/areas/views/create'),
        ]);

        const renderRoute = loadModule(cb);

        importModules.then(([component]) => {
          renderRoute(component);
        });

        importModules.catch(errorLoading);
      },
    },
    {
      path: '/admin/areas/:slug/edit',
      name: 'ideasPage',
      getComponent(nextState, cb) {
        const importModules = Promise.all([
          import('containers/Admin/areas/views/edit'),
        ]);

        const renderRoute = loadModule(cb);

        importModules.then(([component]) => {
          renderRoute(component);
        });

        importModules.catch(errorLoading);
      },
    },

  ],
});
