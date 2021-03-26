import Loadable from 'react-loadable';

export default () => ({
  path: 'settings/areas',
  name: 'admin settings areas',
  component: Loadable({
    loader: () => import('../'),
    loading: () => null,
  }),
  indexRoute: {
    name: 'admin setting areas index',
    component: Loadable({
      loader: () => import('./all'),
      loading: () => null,
    }),
  },
  childRoutes: [
    {
      path: 'new',
      name: 'admin setting areas new',
      component: Loadable({
        loader: () => import('./New'),
        loading: () => null,
      }),
    },
    {
      path: ':areaId',
      name: 'admin setting area edit',
      component: Loadable({
        loader: () => import('./Edit'),
        loading: () => null,
      }),
    },
  ],
});
