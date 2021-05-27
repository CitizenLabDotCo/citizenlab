import { ModuleConfiguration } from 'utils/moduleUtils';
import React from 'react';
import NavItem from './admin/components/NavItem';
import ActivityTab from './admin/components/ActivityTab';

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
    'app.modules.commercial.moderation.admin.containers.tabs': (props) => {
      return <ActivityTab {...props} />;
    },
  },
};

export default configuration;
