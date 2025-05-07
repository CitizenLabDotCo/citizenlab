import React from 'react';

import { AdminRoute } from 'containers/Admin/routes';

import { ModuleConfiguration } from 'utils/moduleUtils';

const VisitorsContainer = React.lazy(
  () => import('./admin/containers/Visitors')
);
const ProjectStatusCard = React.lazy(
  () => import('./admin/components/ProjectStatusCard')
);

export enum analyticsRoutes {
  visitors = 'visitors',
}

// TODO: Replace "dashboards" with link to route in main app once converted.
export type analyticsRouteTypes = AdminRoute<'dashboard/visitors'>;

const configuration: ModuleConfiguration = {
  routes: {
    'admin.dashboards': [
      {
        path: analyticsRoutes.visitors,
        element: <VisitorsContainer />,
      },
    ],
  },
  outlets: {
    'app.containers.Admin.dashboard.summary.projectStatus': ProjectStatusCard,
  },
};

export default configuration;
