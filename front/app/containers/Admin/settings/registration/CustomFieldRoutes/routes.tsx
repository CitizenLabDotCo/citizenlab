import React from 'react';

import { AdminRoute } from 'containers/Admin/routes';

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

export enum customFieldRouteEnum {
  customFields = 'custom-fields',
  new = 'new',
  customFieldsId = '$userCustomFieldId',
  fieldSettings = 'field-settings',
  options = 'options',
  optionsNew = 'options/new',
  userCustomFieldOptionId = 'options/$userCustomFieldOptionId',
}

export type customFieldRouteTypes =
  | AdminRoute<`settings/registration/${customFieldRouteEnum.customFields}`>
  | AdminRoute<`settings/registration/${customFieldRouteEnum.customFields}/${customFieldRouteEnum.new}`>
  | AdminRoute<`settings/registration/${customFieldRouteEnum.customFields}/${string}`>
  | AdminRoute<`settings/registration/${customFieldRouteEnum.customFields}/${string}/${customFieldRouteEnum.fieldSettings}`>
  | AdminRoute<`settings/registration/${customFieldRouteEnum.customFields}/${string}/${customFieldRouteEnum.options}`>
  | AdminRoute<`settings/registration/${customFieldRouteEnum.customFields}/${string}/${customFieldRouteEnum.optionsNew}`>
  | AdminRoute<`settings/registration/${customFieldRouteEnum.customFields}/${string}/${customFieldRouteEnum.options}/${string}`>;

const customFieldsRoute = createRoute({
  getParentRoute: () => registrationRoute,
  path: customFieldRouteEnum.customFields,
  component: () => <AdminCustomFieldsContainer />,
});

const customFieldNewRoute = createRoute({
  getParentRoute: () => customFieldsRoute,
  path: customFieldRouteEnum.new,
  component: () => <AdminNewCustomFieldComponent />,
});

const customFieldEditRoute = createRoute({
  getParentRoute: () => customFieldsRoute,
  path: customFieldRouteEnum.customFieldsId,
  component: () => <AdminCustomFieldEditComponent />,
});

const customFieldSettingsRoute = createRoute({
  getParentRoute: () => customFieldEditRoute,
  path: customFieldRouteEnum.fieldSettings,
  component: () => <AdminCustomFieldRegistrationSettingsComponent />,
});

const customFieldOptionsRoute = createRoute({
  getParentRoute: () => customFieldEditRoute,
  path: customFieldRouteEnum.options,
  component: () => <AdminCustomFieldRegistrationOptionsComponent />,
});

const customFieldOptionsNewRoute = createRoute({
  getParentRoute: () => customFieldEditRoute,
  path: customFieldRouteEnum.optionsNew,
  component: () => <AdminCustomFieldRegistrationOptionsNewComponent />,
});

const customFieldOptionEditRoute = createRoute({
  getParentRoute: () => customFieldEditRoute,
  path: customFieldRouteEnum.userCustomFieldOptionId,
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
