// These are the pages you can go to.
// They are all wrapped in the App component, which should contain the navbar etc
// See http://blog.mxstbr.com/2016/01/react-apps-with-pages for more information
// about the code splitting business

import indexRoute from './index/routes';
import projectRoutes from './show/routes';

const errorLoading = (err) => {
  console.error('Dynamic page loading failed', err); // eslint-disable-line no-console
};

const loadModule = (cb) => (componentModule) => {
  cb(null, componentModule.default);
};

export default (injectReducer) => ({
  path: '/projects',
  name: 'Project page',
  getComponent(nextState, cb) {
    const importModules = Promise.all([
      import('resources/projects/reducer'),
      import('containers/Projects'),
    ]);

    const renderRoute = loadModule(cb);

    importModules.then(([reducer, component]) => {
      injectReducer('projectsRes', reducer.default);
      renderRoute(component);
    });

    importModules.catch(errorLoading);
  },
  indexRoute: indexRoute(injectReducer),
  childRoutes: [projectRoutes(injectReducer)],
});
