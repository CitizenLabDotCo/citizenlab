import React from 'react';

import { AdminRoute } from 'containers/Admin/routes';

import { ModuleConfiguration } from 'utils/moduleUtils';

const AdminModerationComponent = React.lazy(() => import('./admin/containers'));

export enum moderationRoutes {
  moderation = 'moderation',
}

// TODO: Replace "dashboards" with link to route in main app once converted.
export type moderationRouteTypes =
  AdminRoute<`dashboard/${moderationRoutes.moderation}`>;

const configuration: ModuleConfiguration = {
  routes: {
    'admin.dashboards': [
      {
        path: moderationRoutes.moderation,
        element: <AdminModerationComponent />,
      },
    ],
  },
};

export default configuration;
