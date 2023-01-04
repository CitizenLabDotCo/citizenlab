import React from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
const NavItem = React.lazy(() => import('./admin/components/NavItem'));

const AdminInsightsContainerComponent = React.lazy(
  () => import('./admin/containers')
);
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
    admin: [
      {
        path: 'insights',
        element: <AdminInsightsContainerComponent />,
        children: [
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
    ],
  },
  outlets: {
    'app.containers.Admin.sideBar.navItems': (props) => <NavItem {...props} />,
  },
};

export default configuration;
