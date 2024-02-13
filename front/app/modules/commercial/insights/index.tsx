import React from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';

const Tabs = React.lazy(() => import('./admin/components/Tabs'));

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

const configuration: ModuleConfiguration = {
  routes: {
    'admin.reporting': [
      {
        path: 'reports',
        element: <AdminInsightsReportsComponent />,
      },
      {
        path: 'reports/:projectId',
        element: <AdminInsightsProjectReportComponent />,
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
