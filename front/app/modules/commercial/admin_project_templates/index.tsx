import React, { ReactNode } from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
import CreateProjectFromTemplate from './admin/containers/CreateProjectFromTemplate';
import Tab from './admin/components/Tab';
import { TTabName } from 'containers/Admin/projects/all/CreateProject';
import ProjectTemplatePreviewAdminWithEventWrapper from './admin/containers/ProjectTemplatePreviewAdminWithEventWrapper';
import FeatureFlag from 'components/FeatureFlag';

const CitizenTemplatePreviewComponent = React.lazy(
  () => import('./citizen/containers/ProjectTemplatePreviewCitizen')
);
const AdminTemplatePreviewComponent = React.lazy(
  () => import('./admin/containers/ProjectTemplatePreviewAdmin')
);

declare module 'containers/Admin/projects/all/CreateProject' {
  export interface ITabNamesMap {
    template: 'template';
  }
}

type RenderOnSelectedTabValueProps = {
  selectedTabValue: TTabName;
  children: ReactNode;
};

const RenderOnSelectedTabValue = ({
  selectedTabValue,
  children,
}: RenderOnSelectedTabValueProps) => {
  if (selectedTabValue !== 'template') return null;
  return <>{children}</>;
};

const configuration: ModuleConfiguration = {
  routes: {
    citizen: [
      {
        path: 'templates/:projectTemplateId',
        element: <CitizenTemplatePreviewComponent />,
      },
    ],
    'admin.project_templates': [
      {
        path: 'templates/:projectTemplateId',
        element: <AdminTemplatePreviewComponent />,
      },
    ],
  },
  outlets: {
    'app.containers.Admin.projects.all.container': (props) => {
      return (
        <FeatureFlag name="admin_project_templates">
          <ProjectTemplatePreviewAdminWithEventWrapper
            onRender={props.onRender}
          />
        </FeatureFlag>
      );
    },
    'app.containers.Admin.projects.all.createProject': (props) => (
      <FeatureFlag name="admin_project_templates">
        <RenderOnSelectedTabValue selectedTabValue={props.selectedTabValue}>
          <CreateProjectFromTemplate />
        </RenderOnSelectedTabValue>
      </FeatureFlag>
    ),
    'app.containers.Admin.projects.all.createProject.tabs': (props) => {
      return (
        <FeatureFlag name="admin_project_templates">
          <Tab {...props} />
        </FeatureFlag>
      );
    },
  },
};

export default configuration;
