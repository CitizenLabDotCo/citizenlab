// These are the pages you can go to.
// They are all wrapped in the App component, which should contain the navbar etc
// See http://blog.mxstbr.com/2016/01/react-apps-with-pages for more information
// about the code splitting business

import admin from 'containers/Admin/routes';

import { getAsyncInjectors } from 'utils/asyncInjectors';

const errorLoading = (err) => {
  console.error('Dynamic page loading failed', err); // eslint-disable-line no-console
};

const loadModule = (cb) => (componentModule) => {
  cb(null, componentModule.default);
};

export default function createRoutes(store) {
  // Create reusable async injectors using getAsyncInjectors factory
  const { injectReducer } = getAsyncInjectors(store); // eslint-disable-line no-unused-vars

  return [
    {
      path: '/poc',
      name: 'poc',
      getComponent(nextState, cb) {
        const importModules = Promise.all([
          import('containers/PoC/containers/usersTable'),
        ]);

        const renderRoute = loadModule(cb);

        importModules.then(([component]) => {
          renderRoute(component);
        });

        importModules.catch(errorLoading);
      },
    },
    {
      path: '/',
      name: 'home',
      getComponent(nextState, cb) {
        const importModules = Promise.all([
          import('containers/LandingPage/reducer'),
          import('containers/LandingPage'),
        ]);

        const renderRoute = loadModule(cb);

        importModules.then(([reducer, component]) => {
          injectReducer('landingPage', reducer.default);
          renderRoute(component);
        });

        importModules.catch(errorLoading);
      },
    },
    {
      path: '/sign-in',
      name: 'signInPage',
      getComponent(nextState, cb) {
        const importModules = Promise.all([
          import('containers/SignInPage/reducer'),
          import('containers/SignInPage'),
        ]);

        const renderRoute = loadModule(cb);

        importModules.then(([reducer, component]) => {
          injectReducer('signInPage', reducer.default);
          renderRoute(component);
        });

        importModules.catch(errorLoading);
      },
    },
    {
      path: '/register/complete',
      name: 'registrationComplete',
      getComponent(nextState, cb) {
        const importModules = Promise.all([
          import('containers/completeRegistrationPage'),
        ]);

        const renderRoute = loadModule(cb);

        importModules.then(([component]) => {
          renderRoute(component);
        });

        importModules.catch(errorLoading);
      },
    },
    {
      path: '/register',
      name: 'usersNewPage',
      getComponent(nextState, cb) {
        const importModules = Promise.all([
          import('containers/RegisterPage'),
        ]);

        const renderRoute = loadModule(cb);

        importModules.then(([component]) => {
          renderRoute(component);
        });

        importModules.catch(errorLoading);
      },
    },
    {
      path: '/profile/edit',
      name: 'usersEditPage',
      getComponent(nextState, cb) {
        const importModules = Promise.all([
          import('containers/UsersEditPage/reducer'),
          import('containers/UsersEditPage'),
        ]);

        const renderRoute = loadModule(cb);

        importModules.then(([reducer, component]) => {
          injectReducer('usersEditPage', reducer.default);
          renderRoute(component);
        });

        importModules.catch(errorLoading);
      },
    },
    {
      path: '/ideas/new',
      name: 'IdeasNewPage2',
      getComponent(nextState, cb) {
        const importModules = Promise.all([
          import('containers/IdeasNewPage2'),
        ]);

        const renderRoute = loadModule(cb);

        importModules.then(([component]) => {
          renderRoute(component);
        });

        importModules.catch(errorLoading);
      },
    },
    {
      path: '/ideas',
      name: 'ideasPage',
      getComponent(nextState, cb) {
        const importModules = Promise.all([
          import('containers/IdeasIndexPage/reducer'),
          import('containers/IdeasIndexPage'),

        ]);
        const renderRoute = loadModule(cb);

        importModules.then(([reducer, component]) => {
          injectReducer('ideasIndexPage', reducer.default);
          renderRoute(component);
        });

        importModules.catch(errorLoading);
      },
    },
    {
      path: '/ideas/:slug',
      name: 'ideasShow',
      getComponent(nextState, cb) {
        const importModules = Promise.all([
          import('containers/IdeasShowPage'),
        ]);

        const renderRoute = loadModule(cb);

        importModules.then(([component]) => {
          renderRoute(component);
        });

        importModules.catch(errorLoading);
      },
    },
    {
      path: '/profile/:slug',
      name: 'usersShowPage',
      getComponent(nextState, cb) {
        const importModules = Promise.all([
          import('containers/UsersShowPage'),
        ]);

        const renderRoute = loadModule(cb);

        importModules.then(([component]) => {
          renderRoute(component);
        });

        importModules.catch(errorLoading);
      },
    },
    admin(injectReducer),
    {
      path: '/projects',
      name: 'Project page',
      getComponent(nextState, cb) {
        const importModules = Promise.all([
          import('resources/projects/reducer'),
          import('containers/ProjectsIndexPage'),
        ]);

        const renderRoute = loadModule(cb);

        importModules.then(([reducer, component]) => {
          injectReducer('projectsRes', reducer.default);
          renderRoute(component);
        });

        importModules.catch(errorLoading);
      },
    },
    {
      path: '/projects/:projectId',
      name: 'Project page',
      getComponent(nextState, cb) {
        const importModules = Promise.all([
          import('containers/ProjectsShowPage/reducer'),
          import('containers/ProjectsShowPage'),
        ]);

        const renderRoute = loadModule(cb);
        importModules.then(([reducer, component]) => {
          injectReducer('projectContainer', reducer.default);
          renderRoute(component);
        });

        importModules.catch(errorLoading);
      },
      indexRoute: {
        name: 'Project page',
        getComponent(nextState, cb) {
          const importModules = Promise.all([
            import('containers/ProjectsShowPage/info'),
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
          path: '/projects/:projectId/timeline',
          name: 'Project timeline page',
          getComponent(nextState, cb) {
            const importModules = Promise.all([
              import('containers/ProjectsShowPage/timeline/reducer'),
              import('containers/ProjectsShowPage/timeline'),
            ]);

            const renderRoute = loadModule(cb);
            importModules.then(([reducer, component]) => {
              injectReducer('projectTimeline', reducer.default);
              renderRoute(component);
            });

            importModules.catch(errorLoading);
          },
        },
        {
          path: '/projects/:projectId/events',
          name: 'Project\'s events page',
          getComponent(nextState, cb) {
            const importModules = Promise.all([
              import('containers/ProjectsShowPage/events/reducer'),
              import('containers/ProjectsShowPage/events'),
            ]);

            const renderRoute = loadModule(cb);
            importModules.then(([reducer, component]) => {
              injectReducer('projectEvents', reducer.default);
              renderRoute(component);
            });

            importModules.catch(errorLoading);
          },
        },
        {
          path: '/projects/:projectId/page/:pageId',
          name: 'Project\'s page',
          getComponent(nextState, cb) {
            const importModules = Promise.all([
              import('containers/PagesShowPage/reducer'),
              import('containers/ProjectsShowPage/page'),
            ]);

            const renderRoute = loadModule(cb);
            importModules.then(([reducer, component]) => {
              injectReducer('pagesShowPage', reducer.default);
              renderRoute(component);
            });

            importModules.catch(errorLoading);
          },
        },
        {
          path: '/projects/:projectId/ideas',
          name: 'ideas 4 projects page',
          getComponent(nextState, cb) {
            const importModules = Promise.all([
              import('containers/ProjectsShowPage/ideas'),
            ]);

            const renderRoute = loadModule(cb);

            importModules.then(([component]) => {
              renderRoute(component);
            });

            importModules.catch(errorLoading);
          },
        },
      ],
    },
    {
      path: '/sign-in/recover-password',
      name: 'usersPasswordRecovery',
      getComponent(nextState, cb) {
        const importModules = Promise.all([
          import('containers/UsersPasswordRecovery/reducer'),
          import('containers/UsersPasswordRecovery'),
        ]);

        const renderRoute = loadModule(cb);

        importModules.then(([reducer, component]) => {
          injectReducer('usersPasswordRecovery', reducer.default);
          renderRoute(component);
        });

        importModules.catch(errorLoading);
      },
    },
    {
      path: '/reset-password',
      name: 'UsersPasswordReset',
      getComponent(nextState, cb) {
        const importModules = Promise.all([
          import('containers/UsersPasswordReset/reducer'),
          import('containers/UsersPasswordReset'),
        ]);

        const renderRoute = loadModule(cb);

        importModules.then(([reducer, component]) => {
          injectReducer('resetUserPassword', reducer.default);
          renderRoute(component);
        });

        importModules.catch(errorLoading);
      },
    },
    {
      path: '/pages/:id',
      name: 'pagesShowPage',
      getComponent(nextState, cb) {
        const importModules = Promise.all([
          import('containers/PagesShowPage/reducer'),
          import('containers/PagesShowPage'),
        ]);

        const renderRoute = loadModule(cb);

        importModules.then(([reducer, component]) => {
          injectReducer('pagesShowPage', reducer.default);
          renderRoute(component);
        });

        importModules.catch(errorLoading);
      },
    },
    {
      path: '*',
      name: 'notfound',
      getComponent(nextState, cb) {
        import('containers/NotFoundPage')
          .then(loadModule(cb))
          .catch(errorLoading);
      },
    },
  ];
}
