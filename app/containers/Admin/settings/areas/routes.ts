import Loadable from 'react-loadable';
import { LoadableLoadingAdmin } from 'components/UI/LoadableLoading';

export default () => ({
  path: 'settings/areas',
  name: 'admin settings areas',
  component: Loadable({
    loader: () => import('../'),
    loading: LoadableLoadingAdmin
  }),
  indexRoute: {
    name: 'admin setting areas index',
    component: Loadable({
      loader: () => import('./all'),
      loading: LoadableLoadingAdmin
    }),
  },
  childRoutes: [
    {
      path: 'new',
      name: 'admin setting areas new',
      component: Loadable({
        loader: () => import('./New'),
        loading: LoadableLoadingAdmin
      }),
    },
    {
      path: ':areaId',
      name: 'admin setting area edit',
      component: Loadable({
        loader: () => import('./Edit'),
        loading: LoadableLoadingAdmin
      }),
    },
  ],
});
