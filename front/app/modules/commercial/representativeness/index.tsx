import React from 'react';

import { AdminRoute } from 'containers/Admin/routes';

import { ModuleConfiguration } from 'utils/moduleUtils';

const DashboardContainer = React.lazy(
  () => import('./admin/containers/Dashboard')
);

const ReferenceDataInterface = React.lazy(
  () => import('./admin/containers/ReferenceDataInterface')
);

export enum representativenessRoutes {
  representation = 'representation',
  editBaseData = `representation/edit-base-data`,
}

// TODO: Replace "dashboards" with link to route in main app once converted.
export type representativenessRouteTypes =
  | AdminRoute<`dashboard/${representativenessRoutes.representation}`>
  | AdminRoute<`dashboard/${representativenessRoutes.editBaseData}`>;

const configuration: ModuleConfiguration = {
  routes: {
    'admin.dashboards': [
      {
        path: representativenessRoutes.representation,
        element: <DashboardContainer />,
      },
      {
        path: representativenessRoutes.editBaseData,
        element: <ReferenceDataInterface />,
      },
    ],
  },
};

export default configuration;
