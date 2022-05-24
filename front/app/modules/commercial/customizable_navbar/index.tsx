import React from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
import Tab from './admin/components/Tab';
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
    'admin.settings': [
      {
        path: 'navigation',
        element: <CustomNavbarContainer />,
        children: [
          // to do: check on this or if it should be path: ""
          {
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
