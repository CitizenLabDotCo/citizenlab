// These are the users you can go to.
// They are all wrapped in the App component, which should contain the navbar etc
// See http://blog.mxstbr.com/2016/01/react-apps-with-users for more information
// about the code splitting business
const errorLoading = (err) => {
  console.error('Dynamic user loading failed', err); // eslint-disable-line no-console
};

const loadModule = (cb) => (componentModule) => {
  cb(null, componentModule.default);
};

export default (injectReducer) => ({
  path: '/admin/users',
  name: 'ideasUser',
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
    name: 'admin users index',
    getComponent(nextState, cb) {
      const importModules = Promise.all([
        import('containers/Admin/users/index/reducer'),
        import('containers/Admin/users/index/index'),
      ]);

      const renderRoute = loadModule(cb);

      importModules.then(([reducer, component]) => {
        injectReducer('adminUsersIndex', reducer.default);
        renderRoute(component);
      });

      importModules.catch(errorLoading);
    },
  },
});
