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
  // newIdeaStatus: {
  //   component: Loadable({
  //     loader: () => import('./statuses'),
  //     loading: () => null,
  //   }),
  // },
  childRoutes: [
    {
      path: '/',
      component: Loadable({
        loader: () => import('./all'),
        loading: () => null,
      }),
    },
    {
      path: 'statuses',
      component: Loadable({
        loader: () => import('./statuses/all'),
        loading: () => null,
      }),
    },
  ],
});
