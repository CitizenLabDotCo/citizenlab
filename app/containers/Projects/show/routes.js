
import indexRoute from './info/routes';
import ideasRoute from './ideas/routes';

const errorLoading = (err) => {
  console.error('Dynamic page loading failed', err); // eslint-disable-line no-console
};

const loadModule = (cb) => (componentModule) => {
  cb(null, componentModule.default);
};

export default (injectReducer) => ({
  path: '/projects/:projectId',
  name: 'Project page',
  getComponent(nextState, cb) {
    const importModules = Promise.all([
      import('containers/Projects/show'),
    ]);

    const renderRoute = loadModule(cb);
    importModules.then(([component]) => {
      renderRoute(component);
    });

    importModules.catch(errorLoading);
  },
  indexRoute: indexRoute(injectReducer),
  childRoutes: [
    ideasRoute(injectReducer),
  ],
});
