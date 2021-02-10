import React from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { ModuleConfiguration } from 'utils/moduleUtils';
import CustomFieldGraphs from './admin/components/CustomFieldGraphs';
import RegistrationFieldsToGraphs from './admin/components/RegistrationFieldsToGraphs';
import Tab from './admin/components/Tab';
import CustomFieldsStep from './citizen/components/CustomFieldsStep';
import UserCustomFieldsForm from './citizen/components/UserCustomFieldsForm';
import useUserCustomFieldsSchema from './hooks/useUserCustomFieldsSchema';

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
    'admin.settings': [
      {
        path: 'registration',
        container: () => import('./admin/containers/settings/registration'),
      },
    ],
  },
  outlets: {
    'app.containers.Admin.dashboard.users.graphs': RegistrationFieldsToGraphs,
    'app.components.SignUpIn.SignUp.step': (props) => (
      <CustomFieldsStep {...props} />
    ),
    'app.containers.Admin.dashboard.reports.ProjectReport.graphs': CustomFieldGraphs,
    'app.containers.UserEditPage.ProfileForm.forms': (props) => (
      <RenderOnCustomFields>
        <UserCustomFieldsForm {...props} />
      </RenderOnCustomFields>
    ),
    'app.containers.Admin.settings.SettingsPage': (props) => <Tab {...props} />,
  },
};

export default configuration;
