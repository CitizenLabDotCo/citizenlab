import React from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
import NavItem from './admin/components/NavItem';

const configuration: ModuleConfiguration = {
  routes: {
    admin: [
      {
        path: 'processing',
        container: () => import('./admin/containers'),
      },
    ],
  },
  outlets: {
    'app.containers.Admin.sideBar.navItems': (props) => <NavItem {...props} />,
  },
};

export default configuration;
