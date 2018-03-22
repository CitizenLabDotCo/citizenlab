
const errorLoading = (err) => {
  console.error('Dynamic settings loading failed', err); // eslint-disable-line no-console
};

const loadModule = (cb) => (componentModule) => {
  cb(null, componentModule.default);
};

export default () => ({
  path: '/admin/users',
  name: 'admin users',
  getComponent(nextState, cb) {
    const importModules = Promise.all([
      import('containers/Admin/users'),
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
        import('containers/Admin/users/registered'),
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
      path: 'registered',
      getComponent(nextState, cb) {
        const importModules = Promise.all([
          import('containers/Admin/users/registered'),
        ]);

        const renderRoute = loadModule(cb);

        importModules.then(([component]) => {
          renderRoute(component);
        });

        importModules.catch(errorLoading);
      },
    },
    {
      path: 'invitations',
      getComponent(nextState, cb) {
        const importModules = Promise.all([
          import('containers/Admin/users/invitations'),
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
