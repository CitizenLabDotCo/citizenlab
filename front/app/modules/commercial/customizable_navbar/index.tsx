import React, { lazy } from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
import FeatureFlag from 'components/FeatureFlag';
import ModuleActive from './admin/components/ModuleActive';
import PoliciesSubtitle from './admin/components/PoliciesSubtitle';
import PagesMenu from './admin/containers';

const NewPageFormComponent = lazy(
  () => import('./admin/containers/NewPageForm')
);
const EditPageComponent = lazy(() => import('./admin/containers/EditPageForm'));
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
    'app.containers.Admin.pages-menu.index': () => (
      <FeatureFlag name="customizable_navbar">
        <PagesMenu />
      </FeatureFlag>
    ),
    'app.containers.Admin.pages-menu.NavigationSettings': () => (
      <FeatureFlag name="customizable_navbar">
        <NavigationSettings />
      </FeatureFlag>
    ),
  },
};

export default configuration;
