import React from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';

import ProjectFolderCard from './components/ProjectFolderCard';
import ProjectFolderRow from './components/ProjectFolderRow';
import ProjectFolderSiteMap from './components/ProjectFolderSiteMap';

const RenderWhenProjectFolder = ({ publication, children }) => {
  if (publication.publicationType !== 'folder') {
    return null;
  }
  return <>{children}</>;
};

const configuration: ModuleConfiguration = {
  outlets: {
    'app.containers.AdminPage.projects.all.projectsAndFolders.row': (props) => (
      <RenderWhenProjectFolder publication={props.publication}>
        <ProjectFolderRow {...props} />
      </RenderWhenProjectFolder>
    ),
    'app.components.ProjectAndFolderCards.card': (props) => (
      <RenderWhenProjectFolder publication={props.publication}>
        <ProjectFolderCard {...props} />
      </RenderWhenProjectFolder>
    ),
    'app.containers.SiteMap.ProjectsSection.listitem': (props) => (
      <RenderWhenProjectFolder publication={props.adminPublication}>
        <ProjectFolderSiteMap {...props} />
      </RenderWhenProjectFolder>
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
