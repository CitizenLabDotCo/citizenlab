import React from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';

import ProjectFolderCard from './components/ProjectFolderCard';
import ProjectFolderRow from './components/ProjectFolderRow';

const configuration: ModuleConfiguration = {
  outlets: {
    'app.containers.AdminPage.projects.all.projectsAndFolders.row': (props) => (
      <>
        {props.publication.publicationType === 'project_folder' && (
          <ProjectFolderRow {...props} />
        )}
      </>
    ),
    'app.components.ProjectAndFolderCards.card': (props) => (
      <>
        {props.publication.publicationType === 'project_folder' && (
          <ProjectFolderCard {...props} />
        )}
      </>
    ),
  },
  routes: {
    citizen: [
      {
        path: 'folders/:slug',
        name: 'Project folder page',
        container: () => import('./containers/citizen/ProjectFolderShowPage'),
      },
    ],
    admin: [
      {
        path: 'projects/folders/new',
        name: 'admin projects single project',
        container: () => import('./containers/admin/settings'),
      },
      {
        path: 'projects/folders/:projectFolderId',
        name: 'admin projects edit folder',
        container: () => import('./containers/admin'),
        indexRoute: {
          name: 'admin projects edit folder projects',
          container: () => import('./containers/admin/projects'),
        },
        childRoutes: [
          {
            path: 'settings',
            name: 'admin projects edit folder settings',
            container: () => import('./containers/admin/settings'),
          },
        ],
      },
    ],
  },
};

export default configuration;
