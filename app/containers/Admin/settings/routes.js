
const errorLoading = (err) => {
  console.error('Dynamic settings loading failed', err); // eslint-disable-line no-console
};

const loadModule = (cb) => (componentModule) => {
  cb(null, componentModule.default);
};

export default () => ({
  path: '/admin/settings',
  name: 'admin settings',
  getComponent(nextState, cb) {
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
      path: 'general',
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
    {
      path: 'pages',
      getComponent(nextState, cb) {
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
      getComponent(nextState, cb) {
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
    {
      path: 'areas',
      getComponent(nextState, cb) {
        const importModules = Promise.all([
          import('containers/Admin/settings/areas'),
        ]);

        const renderRoute = loadModule(cb);

        importModules.then(([component]) => {
          renderRoute(component);
        });

        importModules.catch(errorLoading);
      },
    },
    {
      path: 'areas/new',
      getComponent(nextState, cb) {
        const importModules = Promise.all([
          import('containers/Admin/settings/areas/new'),
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
