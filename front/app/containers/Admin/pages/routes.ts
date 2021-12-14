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
});
