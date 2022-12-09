import React from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
const NavItem = React.lazy(() => import('./admin/components/NavItem'));

const AdminInsightsContainerComponent = React.lazy(
  () => import('./admin/containers')
);
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
    admin: [
      {
        path: 'insights',
        element: <AdminInsightsContainerComponent />,
        children: [
          {
            index: true,
            element: <AdminInsightsListComponent />,
          },
          {
            path: 'reports',
            element: <AdminInsightsReportsComponent />,
          },
          {
            path: 'reports/:projectId',
            element: <AdminInsightsProjectReportComponent />,
          },
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
    ],
  },
  outlets: {
    'app.containers.Admin.sideBar.navItems': (props) => <NavItem {...props} />,
  },
};

export default configuration;
