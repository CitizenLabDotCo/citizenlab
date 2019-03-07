import Loadable from 'react-loadable';
import { LoadableLoadingAdmin } from 'components/UI/LoadableLoading';

export default () => ({
  path: 'pages',
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
      path: ':pageId/editor/:locale',
      component: Loadable({
        loader: () => import('./BodyEditor'),
        loading: LoadableLoadingAdmin
      }),
    },
    {
      path: ':pageId',
      component: Loadable({
        loader: () => import('./Edit'),
        loading: LoadableLoadingAdmin
      }),
    },
  ],
});
