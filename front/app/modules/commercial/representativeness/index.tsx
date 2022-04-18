import { ModuleConfiguration } from 'utils/moduleUtils';

const configuration: ModuleConfiguration = {
  routes: {
    admin: [
      {
        path: 'dashboard/representativeness',
        container: () => import('./admin/containers/Dashboard'),
      },
    ],
  },
};

export default configuration;
