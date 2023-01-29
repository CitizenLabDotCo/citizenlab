import React from 'react';

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

export default () => ({
  path: 'settings/registration/custom-fields',
  element: <AdminCustomFieldsContainer />,
  children: [
    {
      path: 'new',
      element: <AdminNewCustomFieldComponent />,
    },
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
        {
          path: 'options/new',
          element: <AdminCustomFieldRegistrationOptionsNewComponent />,
        },
        {
          path: 'options/:userCustomFieldOptionId',
          element: <AdminCustomFieldRegistrationOptionsEditComponent />,
        },
      ],
    },
  ],
});
