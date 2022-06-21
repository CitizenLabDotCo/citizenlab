import React from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
import SidebarNavItem from './admin/components/SidebarNavItem';
import ModuleActive from './admin/components/ModuleActive';
import PoliciesSubtitle from './admin/components/PoliciesSubtitle';

const CustomNavbarContainer = React.lazy(() => import('./admin/containers'));
const CustomNavbarSettingsComponent = React.lazy(
  () => import('./admin/containers/NavigationSettings')
);
const NewPageFormComponent = React.lazy(
  () => import('./admin/containers/NewPageForm')
);
const EditPageComponent = React.lazy(
  () => import('./admin/containers/EditPageForm')
);
const EditNavbarItemComponent = React.lazy(
  () => import('./admin/containers/EditNavbarItemForm')
);

const configuration: ModuleConfiguration = {
  routes: {
    admin: [
      {
        path: 'pages-menu',
        element: <CustomNavbarContainer />,
        children: [
          {
            // to be changed when refactoring
            // path: '' should only be used for redirects on
            // index. Search the codebase for examples
            path: '',
            element: <CustomNavbarSettingsComponent />,
          },
          {
            path: 'pages/new',
            element: <NewPageFormComponent />,
          },
          {
            path: 'pages/edit/:pageId',
            element: <EditPageComponent />,
          },
          {
            path: 'navbar-items/edit/:navbarItemId',
            element: <EditNavbarItemComponent />,
          },
        ],
      },
    ],
  },
  outlets: {
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
    'app.containers.Admin.sideBar.navItems': (props) => (
      <SidebarNavItem {...props} />
    ),
  },
};

export default configuration;
