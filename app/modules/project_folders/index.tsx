import React from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
import NewProjectFolderButton from './components/NewProjectFolderButton';

import ProjectFolderCard from './components/ProjectFolderCard';
import ProjectFolderRow from './components/ProjectFolderRow';
import ProjectFolderSiteMap from './components/ProjectFolderSiteMap';
import ProjectFolderTitle from './components/ProjectFolderTitle';

const RenderOnPublicationType = ({ publication, children }) => {
  if (publication.publicationType !== 'project_folder') return null;
  return <>{children}</>;
};

const RenderOnFeatureFlag = ({ featureFlag, children }) => {
  if (!featureFlag) return null;
  return <>{children}</>;
};

const configuration: ModuleConfiguration = {
  outlets: {
    'app.containers.AdminPage.projects.all.projectsAndFolders.title': (
      props
    ) => (
      <RenderOnFeatureFlag featureFlag={props.featureFlag}>
        <ProjectFolderTitle />
      </RenderOnFeatureFlag>
    ),
    'app.containers.AdminPage.projects.all.projectsAndFolders.actions': (
      props
    ) => (
      <RenderOnFeatureFlag featureFlag={props.featureFlag}>
        <NewProjectFolderButton />
      </RenderOnFeatureFlag>
    ),
    'app.containers.AdminPage.projects.all.projectsAndFolders.row': (props) => (
      <RenderOnPublicationType publication={props.publication}>
        <ProjectFolderRow {...props} />
      </RenderOnPublicationType>
    ),
    'app.components.ProjectAndFolderCards.card': (props) => (
      <RenderOnPublicationType publication={props.publication}>
        <ProjectFolderCard {...props} />
      </RenderOnPublicationType>
    ),
    'app.containers.SiteMap.ProjectsSection.listitem': (props) => (
      <RenderOnPublicationType publication={props.adminPublication}>
        <ProjectFolderSiteMap {...props} />
      </RenderOnPublicationType>
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
