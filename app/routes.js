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
          import('containers/LandingPage'),
        ]);

        const renderRoute = loadModule(cb);

        importModules.then(([component]) => {
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
          import('containers/SignInPage'),
        ]);

        const renderRoute = loadModule(cb);

        importModules.then(([component]) => {
          renderRoute(component);
        });

        importModules.catch(errorLoading);
      },
    },
    {
      path: '/sign-up',
      name: 'signUpPage',
      getComponent(nextState, cb) {
        const importModules = Promise.all([
          import('containers/SignUpPage'),
        ]);

        const renderRoute = loadModule(cb);

        importModules.then(([component]) => {
          renderRoute(component);
        });

        importModules.catch(errorLoading);
      },
    },
    {
      path: '/complete-signup',
      name: 'completeSignUpPage',
      getComponent(nextState, cb) {
        const importModules = Promise.all([
          import('containers/CompleteSignUpPage'),
        ]);

        const renderRoute = loadModule(cb);

        importModules.then(([component]) => {
          renderRoute(component);
        });

        importModules.catch(errorLoading);
      },
    },
    {
      path: '/authentication-error',
      name: 'completeSignUpPage',
      getComponent(nextState, cb) {
        const importModules = Promise.all([
          import('containers/CompleteSignUpPage'),
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
      path: '/ideas/edit/:ideaId',
      name: 'IdeasEditPage',
      getComponent(nextState, cb) {
        const importModules = Promise.all([
          import('containers/IdeasEditPage'),
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
          import('containers/IdeasIndexPage'),
        ]);
        const renderRoute = loadModule(cb);

        importModules.then(([component]) => {
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
    admin(injectReducer),
    {
      path: '/projects',
      name: 'Project page',
      getComponent(nextState, cb) {
        const importModules = Promise.all([
          import('containers/ProjectsIndexPage'),
        ]);

        const renderRoute = loadModule(cb);

        importModules.then(([component]) => {
          renderRoute(component);
        });

        importModules.catch(errorLoading);
      },
    },
    {
      path: '/projects/:slug',
      name: 'Project page',
      getComponent(nextState, cb) {
        const importModules = Promise.all([
          import('containers/ProjectsShowPage'),
        ]);

        const renderRoute = loadModule(cb);

        importModules.then(([component]) => {
          renderRoute(component);
        });

        importModules.catch(errorLoading);
      },
      indexRoute: {
        name: 'Project page',
        getComponent(nextState, cb) {
          const importModules = Promise.all([
            import('containers/ProjectsShowPage/timeline'),
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
          path: '/projects/:slug/info',
          name: 'Project\'s info page',
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
        {
          path: '/projects/:slug/events',
          name: 'Project\'s events page',
          getComponent(nextState, cb) {
            const importModules = Promise.all([
              import('containers/ProjectsShowPage/events'),
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
      path: '/pages/:slug',
      name: 'pagesShowPage',
      getComponent(nextState, cb) {
        const importModules = Promise.all([
          import('containers/PagesShowPage'),
        ]);

        const renderRoute = loadModule(cb);

        importModules.then(([component]) => {
          renderRoute(component);
        });

        importModules.catch(errorLoading);
      },
    },
    {
      path: '/password-recovery',
      name: 'passwordRecovery',
      getComponent(nextState, cb) {
        const importModules = Promise.all([
          import('containers/PasswordRecovery'),
        ]);

        const renderRoute = loadModule(cb);

        importModules.then(([component]) => {
          renderRoute(component);
        });

        importModules.catch(errorLoading);
      },
    },
    {
      path: '/reset-password',
      name: 'passwordReset',
      getComponent(nextState, cb) {
        const importModules = Promise.all([
          import('containers/PasswordReset'),
        ]);

        const renderRoute = loadModule(cb);

        importModules.then(([component]) => {
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
