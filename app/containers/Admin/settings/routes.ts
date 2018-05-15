import loadAndRender from 'utils/loadAndRender';

export default () => ({
  path: '/admin/settings',
  name: 'admin settings',
  getComponent: loadAndRender(import('containers/Admin/settings')),
  indexRoute: {
    getComponent: loadAndRender(import('containers/Admin/settings/general')),
  },
  childRoutes: [
    {
      path: 'general',
      getComponent: loadAndRender(import('containers/Admin/settings/general')),
    },
    {
      path: 'customize',
      getComponent: loadAndRender(import('containers/Admin/settings/customize')),
    },
    {
      path: 'pages',
      getComponent: loadAndRender(import('containers/Admin/settings/pages')),
    },
    {
      path: 'registration',
      getComponent: loadAndRender(import('containers/Admin/settings/registration')),
    },
  ],
});
