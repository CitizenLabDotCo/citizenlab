// These are the ideas you can go to.
// They are all wrapped in the App component, which should contain the navbar etc
// See http://blog.mxstbr.com/2016/01/react-apps-with-ideas for more information
// about the code splitting business
const errorLoading = (err) => {
  console.error('Dynamic settings loading failed', err); // eslint-disable-line no-console
};

const loadModule = (cb) => (componentModule) => {
  cb(null, componentModule.default);
};

export default (injectReducer) => ({
  path: '/admin/settings',
  name: 'admin settings',
  getComponent(nextState, cb) {
    const importModules = Promise.all([
      import('containers/Admin/settings/reducer'),
      import('containers/Admin/settings'),
    ]);

    const renderRoute = loadModule(cb);

    importModules.then(([reducer, component]) => {
      injectReducer('adminSettings', reducer.default);
      renderRoute(component);
    });

    importModules.catch(errorLoading);
  },
  indexRoute: {
    getComponent(nextState, cb) {
      const importModules = Promise.all([
        import('containers/Admin/settings/general'),
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
      path: 'customize',
      getComponent(nextState, cb) {
        const importModules = Promise.all([
          import('containers/Admin/settings/customize'),
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
