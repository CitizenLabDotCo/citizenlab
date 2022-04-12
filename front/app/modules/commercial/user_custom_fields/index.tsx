import React from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { ModuleConfiguration } from 'utils/moduleUtils';
import CustomFieldGraphs from './admin/components/CustomFieldGraphs';
import RegistrationFieldsToGraphs from './admin/components/RegistrationFieldsToGraphs';
import AllCustomFields from './admin/components/CustomFields/All';

import CustomFieldsStep from './citizen/components/CustomFieldsStep';
import UserCustomFieldsForm from './citizen/components/UserCustomFieldsForm';
import useUserCustomFieldsSchema from './hooks/useUserCustomFieldsSchema';
import RegistrationQuestions from './admin/components/RegistrationQuestions';
import {
  IUsersByBirthyear,
  IUsersByDomicile,
  IUsersByRegistrationField,
} from './services/stats';
import useFeatureFlag from 'hooks/useFeatureFlag';
import UserCustomFieldsFormMigrated from './citizen/components/UserCustomFieldsFormMigrated';

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
        container: () => import('./admin/containers/CustomFields/'),
        childRoutes: [
          {
            path: 'new',
            container: () =>
              import(
                './admin/containers/CustomFields/RegistrationCustomFieldNew'
              ),
          },
          {
            path: ':userCustomFieldId',
            container: () =>
              import(
                './admin/containers/CustomFields/RegistrationCustomFieldEdit'
              ),
            childRoutes: [
              {
                path: 'field-settings',
                container: () =>
                  import(
                    './admin/containers/CustomFields/RegistrationCustomFieldEdit/RegistrationCustomFieldSettings'
                  ),
              },
              {
                path: 'options',
                container: () =>
                  import(
                    './admin/containers/CustomFields/RegistrationCustomFieldEdit/RegistrationCustomFieldOptions'
                  ),
              },
              {
                path: 'options/new',
                container: () =>
                  import(
                    './admin/containers/CustomFields/RegistrationCustomFieldEdit/RegistrationCustomFieldOptionsNew'
                  ),
              },
              {
                path: 'options/:userCustomFieldOptionId',
                container: () =>
                  import(
                    './admin/containers/CustomFields/RegistrationCustomFieldEdit/RegistrationCustomFieldOptionsEdit'
                  ),
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
