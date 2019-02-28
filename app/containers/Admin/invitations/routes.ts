import Loadable from 'react-loadable';
import { FullPageCenteredSpinner } from 'components/UI/Spinner';

export default () => ({
  path: 'invitations',
  name: 'admin invitations',
  component: Loadable({
    loader: () => import('containers/Admin/invitations'),
    loading: FullPageCenteredSpinner
  }),
});
