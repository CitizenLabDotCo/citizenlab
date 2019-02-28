import Loadable from 'react-loadable';
import { FullPageCenteredSpinner } from 'components/UI/Spinner';

export default () => ({
  path: 'ideas',
  name: 'admin Ideas',
  component: Loadable({
    loader: () => import('containers/Admin/ideas'),
    loading: FullPageCenteredSpinner
  }),
  indexRoute: {
    name: 'admin ideas index',
    component: Loadable({
      loader: () => import('containers/Admin/ideas/all'),
      loading: FullPageCenteredSpinner
    }),
  },
});
