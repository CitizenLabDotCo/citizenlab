import loadAndRender from 'utils/loadAndRender';

export default () => ({
  path: '/admin/settings/areas',
  name: 'admin settings areas',
  getComponent: loadAndRender(import('../')),
  indexRoute: {
    name: 'admin setting areas index',
    getComponent: loadAndRender(import('./all')),
  },
  childRoutes: [
    {
      path: '/admin/settings/areas/new',
      name: 'admin setting areas new',
      getComponent: loadAndRender(import('./New')),
    },
    {
      path: '/admin/settings/areas/:areaId',
      name: 'admin setting area edit',
      getComponent: loadAndRender(import('./Edit')),
    },
  ],
});
