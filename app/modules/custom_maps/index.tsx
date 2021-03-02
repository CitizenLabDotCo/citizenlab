import React, { ReactNode } from 'react';
// import useFeatureFlag from 'hooks/useFeatureFlag';
import { ModuleConfiguration } from 'utils/moduleUtils';
import ProjectCustomMapConfigPage from './admin/containers/ProjectCustomMapConfigPage';
import Tab from './admin/components/Tab';

type RenderOnFeatureFlagProps = {
  children: ReactNode;
};

const RenderOnFeatureFlag = ({ children }: RenderOnFeatureFlagProps) => {
  // const isProjectFoldersEnabled = useFeatureFlag('project_folders');
  // if (isProjectFoldersEnabled) {
  //   return <>{children}</>;
  // }
  // return null;

  return <>{children}</>;
};

const configuration: ModuleConfiguration = {
  routes: {
    admin: [
      {
        path: '/:locale/admin/projects/:projectId/map',
        name: 'admin projects map',
        container: import(
          'modules/custom_maps/admin/containers/ProjectCustomMapConfigPage'
        ),
      },
    ],
  },
  outlets: {
    'app.containers.AdminPage.projects.edit.map': () => (
      <RenderOnFeatureFlag>
        <ProjectCustomMapConfigPage />
      </RenderOnFeatureFlag>
    ),
    'app.containers.Admin.projects.edit.tabs.map': (props) => (
      <Tab {...props} />
    ),
  },
};

export default configuration;
