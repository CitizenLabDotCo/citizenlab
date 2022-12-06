import React from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';

const NavItem = React.lazy(() => import('./admin/components/NavItem'));

const AdminModerationComponent = React.lazy(() => import('./admin/containers'));

const configuration: ModuleConfiguration = {
  routes: {
    admin: [
      {
        path: 'moderation',
        element: <AdminModerationComponent />,
      },
    ],
  },
  outlets: {
    'app.containers.Admin.sideBar.navItems': (props) => <NavItem {...props} />,
  },
};

export default configuration;
