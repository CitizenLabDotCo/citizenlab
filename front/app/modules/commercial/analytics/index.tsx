import React from 'react';

import { AdminRoute } from 'containers/Admin/routes';

import { ModuleConfiguration } from 'utils/moduleUtils';

const VisitorsContainer = React.lazy(
  () => import('../../../containers/Admin/dashboard/visitors')
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
};

export default configuration;
