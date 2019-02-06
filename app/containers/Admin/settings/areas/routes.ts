import Loadable from 'react-loadable';
import Spinner from 'components/UI/Spinner';

export default () => ({
  path: 'settings/areas',
  name: 'admin settings areas',
  component: Loadable({
    loader: () => import('../'),
    loading: Spinner
  }),
  indexRoute: {
    name: 'admin setting areas index',
    component: Loadable({
      loader: () => import('./all'),
      loading: Spinner
    }),
  },
  childRoutes: [
    {
      path: 'new',
      name: 'admin setting areas new',
      component: Loadable({
        loader: () => import('./New'),
        loading: Spinner
      }),
    },
    {
      path: ':areaId',
      name: 'admin setting area edit',
      component: Loadable({
        loader: () => import('./Edit'),
        loading: Spinner
      }),
    },
  ],
});
