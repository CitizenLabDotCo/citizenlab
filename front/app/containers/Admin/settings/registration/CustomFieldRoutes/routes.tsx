import React from 'react';

import { createRoute } from 'utils/router';

import { registrationRoute } from '../routes';

const AdminCustomFieldsContainer = React.lazy(() => import('.'));
const AdminNewCustomFieldComponent = React.lazy(
  () => import('./RegistrationCustomFieldNew')
);
const AdminCustomFieldEditComponent = React.lazy(
  () => import('./RegistrationCustomFieldEdit')
);
const AdminCustomFieldRegistrationSettingsComponent = React.lazy(
  () => import('./RegistrationCustomFieldEdit/RegistrationCustomFieldSettings')
);
const AdminCustomFieldRegistrationOptionsComponent = React.lazy(
  () => import('./RegistrationCustomFieldEdit/RegistrationCustomFieldOptions')
);
const AdminCustomFieldRegistrationOptionsNewComponent = React.lazy(
  () =>
    import('./RegistrationCustomFieldEdit/RegistrationCustomFieldOptionsNew')
);
const AdminCustomFieldRegistrationOptionsEditComponent = React.lazy(
  () =>
    import('./RegistrationCustomFieldEdit/RegistrationCustomFieldOptionsEdit')
);

const customFieldsRoute = createRoute({
  getParentRoute: () => registrationRoute,
  path: 'custom-fields',
  component: () => <AdminCustomFieldsContainer />,
});

const customFieldNewRoute = createRoute({
  getParentRoute: () => customFieldsRoute,
  path: 'new',
  component: () => <AdminNewCustomFieldComponent />,
});

const customFieldEditRoute = createRoute({
  getParentRoute: () => customFieldsRoute,
  path: '$userCustomFieldId',
  component: () => <AdminCustomFieldEditComponent />,
});

const customFieldSettingsRoute = createRoute({
  getParentRoute: () => customFieldEditRoute,
  path: 'field-settings',
  component: () => <AdminCustomFieldRegistrationSettingsComponent />,
});

const customFieldOptionsRoute = createRoute({
  getParentRoute: () => customFieldEditRoute,
  path: 'options',
  component: () => <AdminCustomFieldRegistrationOptionsComponent />,
});

const customFieldOptionsNewRoute = createRoute({
  getParentRoute: () => customFieldEditRoute,
  path: 'options/new',
  component: () => <AdminCustomFieldRegistrationOptionsNewComponent />,
});

const customFieldOptionEditRoute = createRoute({
  getParentRoute: () => customFieldEditRoute,
  path: 'options/$userCustomFieldOptionId',
  component: () => <AdminCustomFieldRegistrationOptionsEditComponent />,
});

const createCustomFieldRoutes = () => {
  return customFieldsRoute.addChildren([
    customFieldNewRoute,
    customFieldEditRoute.addChildren([
      customFieldSettingsRoute,
      customFieldOptionsRoute,
      customFieldOptionsNewRoute,
      customFieldOptionEditRoute,
    ]),
  ]);
};

export default createCustomFieldRoutes;
