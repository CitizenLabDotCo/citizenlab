import React from 'react';

import type { AdminRoute } from 'containers/Admin/routes';

import { ModuleConfiguration } from 'utils/moduleUtils';

const AdminWidgetsContainerComponent = React.lazy(
  () => import('./admin/containers')
);

export enum widgetsRoutes {
  widgets = 'widgets',
}

// TODO: Replace "tools" with link to route in main app once converted.
export type widgetsRouteTypes = AdminRoute<`tools/${widgetsRoutes.widgets}`>;

const configuration: ModuleConfiguration = {
  routes: {
    'admin.tools': [
      {
        path: widgetsRoutes.widgets,
        element: <AdminWidgetsContainerComponent />,
      },
    ],
  },
};

export default configuration;
