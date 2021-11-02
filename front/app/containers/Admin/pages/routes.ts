import Loadable from 'react-loadable';
import { LoadableLoadingAdmin } from 'components/UI/LoadableLoading';

export default () => ({
  path: 'pages',
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
        loader: () => import('./NewPageForm'),
        loading: LoadableLoadingAdmin,
        delay: 500,
      }),
    },
    {
      path: ':pageId',
      component: Loadable({
        loader: () => import('./EditPageForm'),
        loading: LoadableLoadingAdmin,
        delay: 500,
      }),
    },
  ],
});
