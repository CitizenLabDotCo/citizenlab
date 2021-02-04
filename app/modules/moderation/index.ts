import { ModuleConfiguration } from 'utils/moduleUtils';

const configuration: ModuleConfiguration = {
  routes: {
    admin: [
      {
        path: 'moderation',
        name: 'moderation',
        container: () =>
          import('modules/moderation/admin/containers/moderation'),
      },
    ],
  },
};

export default configuration;
