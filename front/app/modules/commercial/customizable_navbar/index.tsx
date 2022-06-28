import React, { lazy } from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
import SidebarNavItem from './admin/components/SidebarNavItem';
import ModuleActive from './admin/components/ModuleActive';
import PoliciesSubtitle from './admin/components/PoliciesSubtitle';

const NewPageFormComponent = lazy(
  () => import('./admin/containers/NewPageForm')
);
const EditPageComponent = lazy(() => import('./admin/containers/EditPageForm'));
const EditNavbarItemComponent = lazy(
  () => import('./admin/containers/EditNavbarItemForm')
);

const configuration: ModuleConfiguration = {
  routes: {
    'admin.pages-menu': [
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
