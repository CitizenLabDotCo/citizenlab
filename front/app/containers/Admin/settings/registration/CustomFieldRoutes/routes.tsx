import React from 'react';

import { AdminRoute } from 'containers/Admin/routes';

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

export enum settingsRegistrationRoutes {
  import = 'import',
  new = 'new',
  userCustomFieldId = ':userCustomFieldId',
  fieldSettings = 'field-settings',
  options = 'options',
  optionsNew = 'options/new',
  optionsUserCustomFieldOptionId = 'options/:userCustomFieldOptionId',
  customFields = 'custom-fields',
}

export type settingsRegistrationRouteTypes =
  | AdminRoute<`settings/registration/${settingsRegistrationRoutes.customFields}/new`>
  | AdminRoute<`settings/registration/${settingsRegistrationRoutes.customFields}/${string}`>
  | AdminRoute<`settings/registration/${settingsRegistrationRoutes.customFields}/${string}/${settingsRegistrationRoutes.fieldSettings}`>
  | AdminRoute<`settings/registration/${settingsRegistrationRoutes.customFields}/${string}/${settingsRegistrationRoutes.options}`>
  | AdminRoute<`settings/registration/${settingsRegistrationRoutes.customFields}/${string}/${settingsRegistrationRoutes.optionsNew}`>
  | AdminRoute<`settings/registration/${settingsRegistrationRoutes.customFields}/${string}/${settingsRegistrationRoutes.options}/${string}`>;

export default () => ({
  path: settingsRegistrationRoutes.customFields,
  element: <AdminCustomFieldsContainer />,
  children: [
    {
      path: settingsRegistrationRoutes.new,
      element: <AdminNewCustomFieldComponent />,
    },
    {
      path: settingsRegistrationRoutes.userCustomFieldId,
      element: <AdminCustomFieldEditComponent />,
      children: [
        {
          path: settingsRegistrationRoutes.fieldSettings,
          element: <AdminCustomFieldRegistrationSettingsComponent />,
        },
        {
          path: settingsRegistrationRoutes.options,
          element: <AdminCustomFieldRegistrationOptionsComponent />,
        },
        {
          path: settingsRegistrationRoutes.optionsNew,
          element: <AdminCustomFieldRegistrationOptionsNewComponent />,
        },
        {
          path: settingsRegistrationRoutes.optionsUserCustomFieldOptionId,
          element: <AdminCustomFieldRegistrationOptionsEditComponent />,
        },
      ],
    },
  ],
});
