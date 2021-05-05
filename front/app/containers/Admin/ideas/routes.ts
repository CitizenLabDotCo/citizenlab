import Loadable from 'react-loadable';
import { LoadableLoadingAdmin } from 'components/UI/LoadableLoading';
import moduleConfiguration from 'modules';

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
  childRoutes: moduleConfiguration.routes['admin.ideas'],
});
