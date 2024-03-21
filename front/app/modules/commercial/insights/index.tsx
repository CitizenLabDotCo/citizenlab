import React from 'react';

import { AdminRoute } from 'containers/Admin/routes';

import { ModuleConfiguration } from 'utils/moduleUtils';

const AdminInsightsReportsComponent = React.lazy(
  () => import('./admin/containers/Reports')
);
const AdminInsightsProjectReportComponent = React.lazy(
  () => import('./admin/containers/Reports/ProjectReport')
);

declare module 'components/UI/Error' {
  interface TFieldNameMap {
    view_name: 'view_name';
    category_name: 'category_name';
  }
}

export enum insightsRoutes {
  reports = 'reports',
  reportId = `${reports}/:projectId`,
}

// TODO: Replace "reporting" with link to route in main app once converted.
export type insightsRouteTypes =
  | AdminRoute<`reporting/${insightsRoutes.reports}`>
  | AdminRoute<`reporting/${insightsRoutes.reports}${string}`>;

const configuration: ModuleConfiguration = {
  routes: {
    'admin.reporting': [
      {
        path: insightsRoutes.reports,
        element: <AdminInsightsReportsComponent />,
      },
      {
        path: insightsRoutes.reportId,
        element: <AdminInsightsProjectReportComponent />,
      },
    ],
  },
};

export default configuration;
