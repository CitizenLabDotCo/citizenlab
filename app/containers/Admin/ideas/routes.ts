const errorLoading = (err) => {
  console.error('Dynamic idea loading failed', err); // eslint-disable-line no-console
};

const loadModule = (cb) => (componentModule) => {
  cb(null, componentModule.default);
};

export default () => ({
  path: '/admin/ideas',
  name: 'admin Ideas',
  getComponent(_nextState, cb) {
    const importModules = Promise.all([
      import('containers/Admin/ideas'),
    ]);

    const renderRoute = loadModule(cb);

    importModules.then(([component]) => {
      renderRoute(component);
    });

    importModules.catch(errorLoading);
  },
  indexRoute: {
    name: 'admin ideas index',
    getComponent(_nextState, cb) {
      const importModules = Promise.all([
        import('containers/Admin/ideas/all'),
      ]);

      const renderRoute = loadModule(cb);

      importModules.then(([component]) => {
        renderRoute(component);
      });

      importModules.catch(errorLoading);
    },
  },
});
