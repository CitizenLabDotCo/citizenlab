import Loadable from 'react-loadable';
import { LoadableLoadingAdmin } from 'components/UI/LoadableLoading';

export default () => ({
  component: Loadable({
    loader: () => import('./'),
    loading: LoadableLoadingAdmin
  }),
  indexRoute: {
    component: Loadable({
      loader: () => import('./All'),
      loading: LoadableLoadingAdmin
    }),
  },
  childRoutes: [
    {
      path: 'new',
      component: Loadable({
        loader: () => import('./New'),
        loading: LoadableLoadingAdmin
      }),
    },
    {
      path: ':customFieldId',
      component: Loadable({
        loader: () => import('./Edit'),
        loading: LoadableLoadingAdmin
      }),
      childRoutes: [
        {
          path: 'general',
          component: Loadable({
            loader: () => import('./Edit/General'),
            loading: LoadableLoadingAdmin
          }),
        },
        {
          path: 'options',
          component: Loadable({
            loader: () => import('./Edit/Options'),
            loading: LoadableLoadingAdmin
          }),
        },
      ],
    },
  ],
});
