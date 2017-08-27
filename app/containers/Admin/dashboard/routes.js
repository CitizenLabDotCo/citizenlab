// These are the ideas you can go to.
// They are all wrapped in the App component, which should contain the navbar etc
// See http://blog.mxstbr.com/2016/01/react-apps-with-ideas for more information
// about the code splitting business
const errorLoading = (err) => {
  console.error('Dynamic dashboard loading failed', err); // eslint-disable-line no-console
};

const loadModule = (cb) => (componentModule) => {
  cb(null, componentModule.default);
};

export default () => ({
  // path: '/admin/dashboard',
  name: 'Admin dashboard',
  getComponent(nextState, cb) {
    const importModules = Promise.all([
      import('containers/Admin/dashboard'),
    ]);

    const renderRoute = loadModule(cb);

    importModules.then(([component]) => {
      renderRoute(component);
    });

    importModules.catch(errorLoading);
  },
});
