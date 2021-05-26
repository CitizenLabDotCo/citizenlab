import React from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
import NavItem from './admin/components/NavItem';

const configuration: ModuleConfiguration = {
  routes: {
    admin: [
      {
        path: 'insights',
        container: () => import('./admin/containers'),
        indexRoute: {
          container: () => import('./admin/containers/Insights'),
        },
        childRoutes: [
          {
            path: 'reports',
            container: () => import('./admin/containers/Reports'),
          },
          {
            path: 'reports/:projectId',
            container: () => import('./admin/containers/Reports/ProjectReport'),
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
