import Loadable from 'react-loadable';
import Spinner from 'components/UI/Spinner';

export default () => ({
  path: 'ideas',
  name: 'admin Ideas',
  component: Loadable({
    loader: () => import('containers/Admin/ideas'),
    loading: Spinner
  }),
  indexRoute: {
    name: 'admin ideas index',
    component: Loadable({
      loader: () => import('containers/Admin/ideas/all'),
      loading: Spinner
    }),
  },
});
