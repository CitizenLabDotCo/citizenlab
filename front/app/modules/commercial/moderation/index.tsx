import { ModuleConfiguration } from 'utils/moduleUtils';
import React from 'react';
const NavItem = React.lazy(() => import('./admin/components/NavItem'));

const AdminModerationComponent = React.lazy(() => import('./admin/containers'));

const configuration: ModuleConfiguration = {
  routes: {
    'admin.dashboards': [
      {
        path: 'moderation',
        element: <AdminModerationComponent />,
      },
    ],
  },
  outlets: {
    'app.containers.Admin.dashboards.tabs': (props) => <NavItem {...props} />,
  },
};

export default configuration;
