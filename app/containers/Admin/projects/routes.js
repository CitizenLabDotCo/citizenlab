// These are the pages you can go to.
// They are all wrapped in the App component, which should contain the navbar etc
// See http://blog.mxstbr.com/2016/01/react-apps-with-pages for more information
// about the code splitting business
const errorLoading = (err) => {
  console.error('Dynamic page loading failed', err); // eslint-disable-line no-console
};

const loadModule = (cb) => (componentModule) => {
  cb(null, componentModule.default);
};

export default (injectReducer) => ({
  path: '/admin/projects',
  name: 'admin projects',
  getComponent(nextState, cb) {
    const importModules = Promise.all([
      import('resources/projects/reducer'),
      import('containers/Admin/projects'),
    ]);

    const renderRoute = loadModule(cb);

    importModules.then(([reducer, component]) => {
      injectReducer('adminProjects', reducer.default);
      renderRoute(component);
    });

    importModules.catch(errorLoading);
  },
  indexRoute: {
    name: 'admin projects index',
    getComponent(nextState, cb) {
      const importModules = Promise.all([
        import('containers/Admin/projects/all'),
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
      path: '/admin/projects/:slug/edit',
      name: 'admin projects single project',
      getComponent(nextState, cb) {
        const importModules = Promise.all([
          import('containers/Admin/projects/edit'),
        ]);

        const renderRoute = loadModule(cb);

        importModules.then(([component]) => {
          renderRoute(component);
        });

        importModules.catch(errorLoading);
      },
      indexRoute: {
        name: 'admin projects single edit',
        getComponent(nextState, cb) {
          const importModules = Promise.all([
            import('containers/Admin/projects/edit/general'),
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
          path: '/admin/projects/:slug/description',
          name: 'admin projects description',
          getComponent(nextState, cb) {
            const importModules = Promise.all([
              import('containers/Admin/projects/edit/description'),
            ]);

            const renderRoute = loadModule(cb);

            importModules.then(([component]) => {
              renderRoute(component);
            });

            importModules.catch(errorLoading);
          },
        },
        {
          path: '/admin/projects/:slug/ideas',
          name: 'admin projects ideas manager',
          getComponent(nextState, cb) {
            const importModules = Promise.all([
              import('components/admin/IdeaManager'),
            ]);

            const renderRoute = loadModule(cb);

            importModules.then(([component]) => {
              renderRoute(component);
            });

            importModules.catch(errorLoading);
          },
        },
        {
          path: '/admin/projects/:slug/timeline',
          name: 'admin projects timeline',
          getComponent(nextState, cb) {
            const importModules = Promise.all([
              import('containers/Admin/projects/edit/timeline'),
            ]);

            const renderRoute = loadModule(cb);

            importModules.then(([component]) => {
              renderRoute(component);
            });

            importModules.catch(errorLoading);
          },
        },
        {
          path: '/admin/projects/:slug/timeline/new',
          name: 'admin projects timeline create',
          getComponent(nextState, cb) {
            const importModules = Promise.all([
              import('containers/Admin/projects/edit/timeline/edit'),
            ]);

            const renderRoute = loadModule(cb);

            importModules.then(([component]) => {
              renderRoute(component);
            });

            importModules.catch(errorLoading);
          },
        },
        {
          path: '/admin/projects/:slug/timeline/:id',
          name: 'admin projects timeline edit',
          getComponent(nextState, cb) {
            const importModules = Promise.all([
              import('containers/Admin/projects/edit/timeline/edit'),
            ]);

            const renderRoute = loadModule(cb);

            importModules.then(([component]) => {
              renderRoute(component);
            });

            importModules.catch(errorLoading);
          },
        },
        {
          path: '/admin/projects/:slug/events',
          name: 'admin projects events',
          getComponent(nextState, cb) {
            const importModules = Promise.all([
              import('containers/Admin/projects/edit/events'),
            ]);

            const renderRoute = loadModule(cb);

            importModules.then(([component]) => {
              renderRoute(component);
            });

            importModules.catch(errorLoading);
          },
        },
        {
          path: '/admin/projects/:slug/events/new',
          name: 'admin projects events create',
          getComponent(nextState, cb) {
            const importModules = Promise.all([
              import('containers/Admin/projects/edit/events/edit'),
            ]);

            const renderRoute = loadModule(cb);

            importModules.then(([component]) => {
              renderRoute(component);
            });

            importModules.catch(errorLoading);
          },
        },
        {
          path: '/admin/projects/:slug/events/:id',
          name: 'admin projects events edit',
          getComponent(nextState, cb) {
            const importModules = Promise.all([
              import('containers/Admin/projects/edit/events/edit'),
            ]);

            const renderRoute = loadModule(cb);

            importModules.then(([component]) => {
              renderRoute(component);
            });

            importModules.catch(errorLoading);
          },
        },
        {
          path: '/admin/projects/new',
          name: 'admin projects create new',
          getComponent(nextState, cb) {
            const importModules = Promise.all([
              import('containers/Admin/projects/edit/general'),
            ]);

            const renderRoute = loadModule(cb);

            importModules.then(([component]) => {
              renderRoute(component);
            });

            importModules.catch(errorLoading);
          },
        },
        {
          path: '/admin/projects/:slug/events',
          name: 'admin projects edit events',
          getComponent(nextState, cb) {
            const importModules = Promise.all([
              import('containers/Admin/projects/edit/events'),
            ]);

            const renderRoute = loadModule(cb);

            importModules.then(([component]) => {
              renderRoute(component);
            });

            importModules.catch(errorLoading);
          },
        },
        {
          path: '/admin/projects/:slug/permissions',
          name: 'admin projects edit permissions',
          getComponent(nextState, cb) {
            const importModules = Promise.all([
              import('containers/Admin/projects/edit/permissions'),
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
  ],
});
