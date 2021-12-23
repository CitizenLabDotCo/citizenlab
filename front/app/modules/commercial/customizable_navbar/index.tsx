import React from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
import Tab from './admin/components/Tab';
import ModuleActive from './admin/components/ModuleActive';
import PoliciesSubtitle from './admin/components/PoliciesSubtitle';

const configuration: ModuleConfiguration = {
  routes: {
    'admin.settings': [
      {
        path: 'navigation',
        container: () => import('./admin/containers'),
        indexRoute: {
          container: () => import('./admin/containers/NavigationSettings'),
        },
        childRoutes: [
          {
            path: 'pages/new',
            container: () => import('./admin/containers/NewPageForm'),
          },
          {
            path: 'pages/edit/:pageId',
            container: () => import('./admin/containers/EditPageForm'),
          },
          {
            path: 'navbar-items/edit/:navbarItemId',
            container: () => import('./admin/containers/EditNavbarItemForm'),
          },
        ],
      },
    ],
  },
  outlets: {
    'app.containers.Admin.settings.tabs': (props) => <Tab {...props} />,
    'app.containers.Admin.settings.customize.Events': (props) => (
      <ModuleActive {...props} />
    ),
    'app.containers.Admin.settings.customize.AllInput': (props) => (
      <ModuleActive {...props} />
    ),
    'app.containers.Admin.initiatives.settings.EnableSwitch': (props) => (
      <ModuleActive {...props} />
    ),
    'app.containers.Admin.settings.policies.start': (props) => (
      <ModuleActive {...props} />
    ),
    'app.containers.Admin.settings.policies.subTitle': () => (
      <PoliciesSubtitle />
    ),
  },
};

export default configuration;
