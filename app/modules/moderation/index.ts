import { ModuleConfiguration } from 'utils/moduleUtils';

const configuration: ModuleConfiguration = {
  routes: {
    admin: [
      {
        path: 'moderation',
        name: 'moderation',
        container: () => import('containers/Admin/moderation'),
      },
    ],
  },
};

export default configuration;
