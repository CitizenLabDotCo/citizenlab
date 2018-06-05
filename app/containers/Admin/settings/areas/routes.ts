import loadAndRender from 'utils/loadAndRender';

export default () => ({
  path: 'settings/areas',
  name: 'admin settings areas',
  getComponent: loadAndRender(import('../')),
  indexRoute: {
    name: 'admin setting areas index',
    getComponent: loadAndRender(import('./all')),
  },
  childRoutes: [
    {
      path: 'new',
      name: 'admin setting areas new',
      getComponent: loadAndRender(import('./New')),
    },
    {
      path: ':areaId',
      name: 'admin setting area edit',
      getComponent: loadAndRender(import('./Edit')),
    },
  ],
});
