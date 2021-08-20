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
          container: () => import('./admin/containers/Insights/List'),
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
          {
            path: ':viewId',
            container: () => import('./admin/containers/Insights/Details'),
          },
          {
            path: ':viewId/edit',
            container: () => import('./admin/containers/Insights/Edit'),
          },
          {
            path: ':viewId/detect',
            container: () => import('./admin/containers/Insights/Detect'),
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
