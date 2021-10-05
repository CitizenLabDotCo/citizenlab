import { ModuleConfiguration } from 'utils/moduleUtils';

const configuration: ModuleConfiguration = {
  routes: {
    'admin.settings': [
      {
        path: 'navigation',
        container: () => import('./admin/NavigationTab'),
      },
    ],
  },
};

export default configuration;
