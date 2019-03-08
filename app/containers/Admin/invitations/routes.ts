import Loadable from 'react-loadable';
import { LoadableLoadingAdmin } from 'components/UI/LoadableLoading';

export default () => ({
  path: 'invitations',
  name: 'admin invitations',
  component: Loadable({
    loader: () => import('containers/Admin/invitations'),
    loading: LoadableLoadingAdmin,
    delay: 500
  }),
});
