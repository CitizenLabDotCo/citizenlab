import React, { lazy } from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
import FeatureFlag from 'components/FeatureFlag';
import ModuleActive from './admin/components/ModuleActive';
import PoliciesSubtitle from './admin/components/PoliciesSubtitle';
import PagesMenu from './admin/containers';
import NavbarTitleField from './admin/components/NavbarTitleField';

const NewPageForm = lazy(() => import('./admin/containers/NewPageForm'));
const EditNavbarItemForm = lazy(
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
        element: <NewPageForm />,
      },
      {
        path: 'navbar-items/edit/:navbarItemId',
        element: <EditNavbarItemForm />,
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
    'app.components.PageForm.index.top': ({ errors }) => (
      <FeatureFlag name="customizable_navbar">
        <NavbarTitleField error={errors.nav_bar_item_title_multiloc} />
      </FeatureFlag>
    ),
  },
};

export default configuration;
