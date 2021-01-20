import { ModuleConfiguration } from 'utils/moduleUtils';

const configuration: ModuleConfiguration = {
  routes: {
    admin: [
      {
        path: 'projects/:projectId/ideaform',
        name: 'admin projects idea form',
        container: () => import('./admin/containers/projects/edit/ideaform'),
      },
    ],
  },
};

export default configuration;
