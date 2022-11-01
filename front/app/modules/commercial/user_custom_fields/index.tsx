import React from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { ModuleConfiguration } from 'utils/moduleUtils';

import CustomFieldsStep from './citizen/components/CustomFieldsStep';

const UserCustomFieldsForm = React.lazy(
  () => import('./citizen/components/UserCustomFieldsForm')
);
import useUserCustomFieldsSchema from './hooks/useUserCustomFieldsSchema';
const RegistrationQuestions = React.lazy(
  () => import('./admin/components/RegistrationQuestions')
);
import {
  IUsersByBirthyear,
  IUsersByDomicile,
  IUsersByRegistrationField,
} from './services/stats';
import useFeatureFlag from 'hooks/useFeatureFlag';
const UserCustomFieldsFormMigrated = React.lazy(
  () => import('./citizen/components/UserCustomFieldsFormMigrated')
);

const CustomFieldGraphs = React.lazy(
  () => import('./admin/components/CustomFieldGraphs')
);
const RegistrationFieldsToGraphs = React.lazy(
  () => import('./admin/components/RegistrationFieldsToGraphs')
);
const AllCustomFields = React.lazy(
  () => import('./admin/components/CustomFields/All')
);

const AdminCustomFieldsContainer = React.lazy(
  () => import('./admin/containers/CustomFields/')
);
const AdminNewCustomFieldComponent = React.lazy(
  () => import('./admin/containers/CustomFields/RegistrationCustomFieldNew')
);
const AdminCustomFieldEditComponent = React.lazy(
  () => import('./admin/containers/CustomFields/RegistrationCustomFieldEdit')
);
const AdminCustomFieldRegistrationSettingsComponent = React.lazy(
  () =>
    import(
      './admin/containers/CustomFields/RegistrationCustomFieldEdit/RegistrationCustomFieldSettings'
    )
);
const AdminCustomFieldRegistrationOptionsComponent = React.lazy(
  () =>
    import(
      './admin/containers/CustomFields/RegistrationCustomFieldEdit/RegistrationCustomFieldOptions'
    )
);
const AdminCustomFieldRegistrationOptionsNewComponent = React.lazy(
  () =>
    import(
      './admin/containers/CustomFields/RegistrationCustomFieldEdit/RegistrationCustomFieldOptionsNew'
    )
);
const AdminCustomFieldRegistrationOptionsEditComponent = React.lazy(
  () =>
    import(
      './admin/containers/CustomFields/RegistrationCustomFieldEdit/RegistrationCustomFieldOptionsEdit'
    )
);

declare module 'resources/GetSerieFromStream' {
  export interface ISupportedDataTypeMap {
    usersByBirthyear: IUsersByBirthyear;
  }
}

declare module 'containers/Admin/dashboard/users/charts/BarChartByCategory' {
  export interface ISupportedDataTypeMap {
    usersByBirthyear: IUsersByBirthyear;
    usersByRegistrationField: IUsersByRegistrationField;
    usersByDomicile: IUsersByDomicile;
  }
}

declare module 'containers/Admin/dashboard/users/charts/HorizontalBarChart' {
  export interface ISupportedDataTypeMap {
    usersByBirthyear: IUsersByBirthyear;
    usersByRegistrationField: IUsersByRegistrationField;
    usersByDomicile: IUsersByDomicile;
  }
}

declare module 'containers/Admin/dashboard/users/charts/PieChartByCategory' {
  export interface ISupportedDataTypeMap {
    usersByBirthyear: IUsersByBirthyear;
    usersByRegistrationField: IUsersByRegistrationField;
  }
}

const RenderOnCustomFields = ({ children }) => {
  const userCustomFieldsSchema = useUserCustomFieldsSchema();

  const hasCustomFields =
    !isNilOrError(userCustomFieldsSchema) &&
    userCustomFieldsSchema.hasCustomFields;

  if (!hasCustomFields) return null;

  return <>{children}</>;
};

const configuration: ModuleConfiguration = {
  routes: {
    admin: [
      {
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
      },
    ],
  },
  outlets: {
    'app.containers.Admin.dashboard.users.graphs': RegistrationFieldsToGraphs,
    'app.components.SignUpIn.SignUp.step': ({
      metaData: _metaData,
      ...props
    }) => <CustomFieldsStep {...props} />,
    'app.containers.Admin.dashboard.reports.ProjectReport.graphs':
      CustomFieldGraphs,
    'app.containers.UserEditPage.ProfileForm.forms': (props) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const useJSONForm = useFeatureFlag({
        name: 'jsonforms_custom_fields',
      });
      return useJSONForm ? (
        <RenderOnCustomFields>
          <UserCustomFieldsFormMigrated {...props} />
        </RenderOnCustomFields>
      ) : (
        <RenderOnCustomFields>
          <UserCustomFieldsForm {...props} />
        </RenderOnCustomFields>
      );
    },
    'app.containers.Admin.settings.registrationTabEnd': AllCustomFields,
    'app.containers.Admin.settings.registrationSectionEnd':
      RegistrationQuestions,
  },
};

export default configuration;
