import React from 'react';

const AdminCustomFieldsContainer = React.lazy(() => import('.'));
const AdminCustomFieldEditComponent = React.lazy(
  () => import('./RegistrationCustomFieldEdit')
);
const AdminCustomFieldRegistrationSettingsComponent = React.lazy(
  () => import('./RegistrationCustomFieldEdit/RegistrationCustomFieldSettings')
);
const AdminCustomFieldRegistrationOptionsComponent = React.lazy(
  () => import('./RegistrationCustomFieldEdit/RegistrationCustomFieldOptions')
);

export default () => ({
  path: 'settings/registration/custom-fields',
  element: <AdminCustomFieldsContainer />,
  children: [
    {
      path: ':userCustomFieldId',
      element: <AdminCustomFieldEditComponent />,
      children: [
        {
          path: 'field-settings',
          element: <AdminCustomFieldRegistrationSettingsComponent />,
        },
        {
          path: 'options',
          element: <AdminCustomFieldRegistrationOptionsComponent />,
        },
      ],
    },
  ],
});
