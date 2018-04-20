const errorLoading = (err) => {
  console.error('Dynamic settings loading failed', err); // eslint-disable-line no-console
};

const loadModule = (cb) => (componentModule) => {
  cb(null, componentModule.default);
};

export default () => ({
  path: '/admin/settings',
  name: 'admin settings',
  getComponent(_nextState, cb) {
    const importModules = Promise.all([
      import('containers/Admin/settings'),
    ]);

    const renderRoute = loadModule(cb);

    importModules.then(([component]) => {
      renderRoute(component);
    });

    importModules.catch(errorLoading);
  },
  indexRoute: {
    getComponent(_nextState, cb) {
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
      path: 'general',
      getComponent(_nextState, cb) {
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
    {
      path: 'customize',
      getComponent(_nextState, cb) {
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
    {
      path: 'pages',
      getComponent(_nextState, cb) {
        const importModules = Promise.all([
          import('containers/Admin/settings/pages'),
        ]);

        const renderRoute = loadModule(cb);

        importModules.then(([component]) => {
          renderRoute(component);
        });

        importModules.catch(errorLoading);
      },
    },
    {
      path: 'registration',
      getComponent(_nextState, cb) {
        const importModules = Promise.all([
          import('containers/Admin/settings/registration'),
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
