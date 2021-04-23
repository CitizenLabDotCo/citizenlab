import { ModuleConfiguration } from 'utils/moduleUtils';
import React from 'react';
import NavItem from './admin/components/NavItem';

const configuration: ModuleConfiguration = {
  routes: {
    admin: [
      {
        path: 'moderation',
        name: 'moderation',
        container: () => import('./admin/containers'),
      },
    ],
  },
  outlets: {
    'app.containers.Admin.sideBar.navItems': (props) => <NavItem {...props} />,
  },
};

export default configuration;
