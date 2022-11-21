import React, { lazy } from 'react';
import PageLoading from 'components/UI/PageLoading';

const AdminSettingsRegistration = lazy(() => import('.'));

const AdminCustomFieldsContainer = React.lazy(() => import('./CustomFields'));
const AdminNewCustomFieldComponent = React.lazy(
  () => import('./CustomFields/RegistrationCustomFieldNew')
);
const AdminCustomFieldEditComponent = React.lazy(
  () => import('./CustomFields/RegistrationCustomFieldEdit')
);
const AdminCustomFieldRegistrationSettingsComponent = React.lazy(
  () =>
    import(
      './CustomFields/RegistrationCustomFieldEdit/RegistrationCustomFieldSettings'
    )
);
const AdminCustomFieldRegistrationOptionsComponent = React.lazy(
  () =>
    import(
      './CustomFields/RegistrationCustomFieldEdit/RegistrationCustomFieldOptions'
    )
);
const AdminCustomFieldRegistrationOptionsNewComponent = React.lazy(
  () =>
    import(
      './CustomFields/RegistrationCustomFieldEdit/RegistrationCustomFieldOptionsNew'
    )
);
const AdminCustomFieldRegistrationOptionsEditComponent = React.lazy(
  () =>
    import(
      './CustomFields/RegistrationCustomFieldEdit/RegistrationCustomFieldOptionsEdit'
    )
);

export default () => ({
  path: 'registration',
  element: (
    <PageLoading>
      <AdminSettingsRegistration />
    </PageLoading>
  ),
  children: [
    {
      path: 'custom-fields',
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
    },
  ],
});
