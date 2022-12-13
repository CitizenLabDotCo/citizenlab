import React from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';

const Tabs = React.lazy(() => import('./admin/components/Tabs'));
const AdminInsightsListComponent = React.lazy(
  () => import('./admin/containers/Insights/List')
);
const AdminInsightsReportsComponent = React.lazy(
  () => import('./admin/containers/Reports')
);
const AdminInsightsProjectReportComponent = React.lazy(
  () => import('./admin/containers/Reports/ProjectReport')
);
const AdminInsightsViewComponent = React.lazy(
  () => import('./admin/containers/Insights/Details')
);
const AdminInsightsViewEditComponent = React.lazy(
  () => import('./admin/containers/Insights/Edit')
);
const AdminInsightsViewDetectComponent = React.lazy(
  () => import('./admin/containers/Insights/Detect')
);

declare module 'components/UI/Error' {
  interface TFieldNameMap {
    view_name: 'view_name';
    category_name: 'category_name';
  }
}

const configuration: ModuleConfiguration = {
  routes: {
    'admin.reporting': [
      {
        path: 'insights',
        element: <AdminInsightsListComponent />,
        children: [
          {
            path: ':viewId',
            element: <AdminInsightsViewComponent />,
          },
          {
            path: ':viewId/edit',
            element: <AdminInsightsViewEditComponent />,
          },
          {
            path: ':viewId/detect',
            element: <AdminInsightsViewDetectComponent />,
          },
        ],
      },
      {
        path: 'reports',
        element: <AdminInsightsReportsComponent />,
        children: [
          {
            path: ':projectId',
            element: <AdminInsightsProjectReportComponent />,
          },
        ],
      },
    ],
  },
  outlets: {
    'app.containers.Admin.reporting.components.Tabs': ({ onData }) => (
      <Tabs onData={onData} />
    ),
  },
};

export default configuration;
