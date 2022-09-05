import { ModuleConfiguration } from 'utils/moduleUtils';
import React from 'react';
import NavItem from './admin/components/NavItem';

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
