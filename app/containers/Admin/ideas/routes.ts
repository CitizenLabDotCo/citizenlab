import Loadable from 'react-loadable';
import { LoadableLoadingAdmin } from 'components/UI/LoadableLoading';

export default () => ({
  name: 'Admin Ideas',
  path: 'ideas',
  component: Loadable({
    loader: () => import('./index'),
    loading: LoadableLoadingAdmin,
    delay: 500,
  }),
  indexRoute: {
    component: Loadable({
      loader: () => import('./all'),
      loading: () => null,
      delay: 500,
    }),
  },
  childRoutes: [
    {
      path: 'statuses',
      component: Loadable({
        loader: () => import('./statuses/all'),
        loading: () => null,
      }),
    },
    {
      path: 'statuses/new',
      component: Loadable({
        loader: () => import('./statuses/new'),
        loading: () => null,
      }),
    },
    {
      path: 'statuses/:id',
      component: Loadable({
        loader: () => import('./statuses/edit'),
        loading: () => null,
      }),
    },
  ],
});
