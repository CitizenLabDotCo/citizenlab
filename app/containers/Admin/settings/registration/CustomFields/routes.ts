import Loadable from 'react-loadable';
import { LoadableLoadingAdmin } from 'components/UI/LoadableLoading';

export default () => ({
  component: Loadable({
    loader: () => import('./'),
    loading: LoadableLoadingAdmin,
    delay: 500,
  }),
  indexRoute: {
    component: Loadable({
      loader: () => import('./All'),
      loading: LoadableLoadingAdmin,
      delay: 500,
    }),
  },
  childRoutes: [
    {
      path: 'new',
      component: Loadable({
        loader: () => import('./New'),
        loading: LoadableLoadingAdmin,
        delay: 500,
      }),
    },
    {
      path: ':customFieldId',
      component: Loadable({
        loader: () => import('./Edit'),
        loading: LoadableLoadingAdmin,
        delay: 500,
      }),
      childRoutes: [
        {
          path: 'general',
          component: Loadable({
            loader: () => import('./Edit/General'),
            loading: () => null,
          }),
        },
        {
          path: 'options',
          component: Loadable({
            loader: () => import('./Edit/Options'),
            loading: () => null,
          }),
        },
      ],
    },
  ],
});
