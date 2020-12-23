import { ModuleConfiguration } from 'utils/moduleUtils';

const configuration: ModuleConfiguration = {
  routes: {
    'admin.settings': [
      {
        path: 'registration',
        container: () => import('./admin/containers/settings/registration'),
      },
    ],
  },
};

export default configuration;
