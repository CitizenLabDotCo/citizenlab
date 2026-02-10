import React, { ReactNode } from 'react';

import { TTabName } from 'containers/Admin/projects/new';
import type { AdminRoute } from 'containers/Admin/routes';

import { ModuleConfiguration } from 'utils/moduleUtils';

const CreateProjectFromTemplate = React.lazy(
  () => import('./admin/containers/CreateProjectFromTemplate')
);
const Tab = React.lazy(() => import('./admin/components/Tab'));

const CitizenTemplatePreviewComponent = React.lazy(
  () => import('./citizen/containers/ProjectTemplatePreviewCitizen')
);
const AdminTemplatePreviewComponent = React.lazy(
  () => import('./admin/containers/ProjectTemplatePreviewAdmin')
);

declare module 'containers/Admin/projects/new' {
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

export enum projectTemplateRoutes {
  projectTemplate = 'templates/:projectTemplateId',
}

// TODO: Replace "project_templates" with link to route in main app once converted.
export type projectTemplateRouteTypes =
  | `${projectTemplateRoutes.projectTemplate}/${string}`
  | AdminRoute<`project_templates/${projectTemplateRoutes.projectTemplate}/${string}`>;

const configuration: ModuleConfiguration = {
  routes: {
    citizen: [
      {
        path: projectTemplateRoutes.projectTemplate,
        element: <CitizenTemplatePreviewComponent />,
      },
    ],
    'admin.project_templates': [
      {
        path: projectTemplateRoutes.projectTemplate,
        element: <AdminTemplatePreviewComponent />,
      },
    ],
  },
  outlets: {
    'app.containers.Admin.projects.all.createProject': (props) => (
      <RenderOnSelectedTabValue selectedTabValue={props.selectedTabValue}>
        <CreateProjectFromTemplate />
      </RenderOnSelectedTabValue>
    ),
    'app.containers.Admin.projects.all.createProject.tabs': (props) => {
      return <Tab {...props} />;
    },
  },
};

export default configuration;
