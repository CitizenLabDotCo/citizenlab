import React, { lazy } from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
const PagesMenu = React.lazy(() => import('./admin/containers'));
const NavbarTitleField = React.lazy(
  () => import('./admin/components/NavbarTitleField')
);

const EditNavbarItemComponent = lazy(
  () => import('./admin/containers/EditNavbarItemForm')
);

const NavigationSettings = lazy(
  () => import('./admin/containers/NavigationSettings')
);

const configuration: ModuleConfiguration = {
  routes: {
    'admin.pages-menu': [
      {
        path: 'navbar-items/edit/:navbarItemId',
        element: <EditNavbarItemComponent />,
      },
    ],
  },
  outlets: {
    'app.containers.Admin.pages-menu.index': () => <PagesMenu />,
    'app.containers.Admin.pages-menu.NavigationSettings': () => (
      <NavigationSettings />
    ),
    'app.components.PageForm.index.top': (props) => (
      <NavbarTitleField {...props} />
    ),
  },
};

export default configuration;
