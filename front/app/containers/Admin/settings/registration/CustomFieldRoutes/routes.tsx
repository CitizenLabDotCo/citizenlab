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

export enum customFieldRouteEnum {
  customFields = 'custom-fields',
  new = 'new',
  customFieldsId = ':userCustomFieldId',
  fieldSettings = 'field-settings',
  options = 'options',
  optionsNew = 'options/new',
  userCustomFieldOptionId = 'options/:userCustomFieldOptionId',
}

export type customFieldRouteTypes =
  | AdminRoute<`settings/registration/${customFieldRouteEnum.customFields}`>
  | AdminRoute<`settings/registration/${customFieldRouteEnum.customFields}/${customFieldRouteEnum.new}`>
  | AdminRoute<`settings/registration/${customFieldRouteEnum.customFields}/${string}`>
  | AdminRoute<`settings/registration/${customFieldRouteEnum.customFields}/${string}/${customFieldRouteEnum.fieldSettings}`>
  | AdminRoute<`settings/registration/${customFieldRouteEnum.customFields}/${string}/${customFieldRouteEnum.options}`>
  | AdminRoute<`settings/registration/${customFieldRouteEnum.customFields}/${string}/${customFieldRouteEnum.optionsNew}`>
  | AdminRoute<`settings/registration/${customFieldRouteEnum.customFields}/${string}/${customFieldRouteEnum.options}/${string}`>;

export default () => ({
  path: customFieldRouteEnum.customFields,
  element: <AdminCustomFieldsContainer />,
  children: [
    {
      path: customFieldRouteEnum.new,
      element: <AdminNewCustomFieldComponent />,
    },
    {
      path: customFieldRouteEnum.customFieldsId,
      element: <AdminCustomFieldEditComponent />,
      children: [
        {
          path: customFieldRouteEnum.fieldSettings,
          element: <AdminCustomFieldRegistrationSettingsComponent />,
        },
        {
          path: customFieldRouteEnum.options,
          element: <AdminCustomFieldRegistrationOptionsComponent />,
        },
        {
          path: customFieldRouteEnum.optionsNew,
          element: <AdminCustomFieldRegistrationOptionsNewComponent />,
        },
        {
          path: customFieldRouteEnum.userCustomFieldOptionId,
          element: <AdminCustomFieldRegistrationOptionsEditComponent />,
        },
      ],
    },
  ],
});
