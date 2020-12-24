import { ModuleConfiguration } from 'utils/moduleUtils';
import RegistrationFieldsToGraphs from './admin/components/RegistrationFieldsToGraphs';

const configuration: ModuleConfiguration = {
  routes: {
    'admin.settings': [
      {
        path: 'registration',
        container: () => import('./admin/containers/settings/registration'),
      },
    ],
  },
  outlets: {
    'app.containers.Admin.dashboard.users.graphs': RegistrationFieldsToGraphs,
  },
};

export default configuration;
