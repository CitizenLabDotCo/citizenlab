import { TSignUpSteps } from 'components/SignUpIn/SignUp';
import React, { ReactNode } from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
import CustomFieldGraphs from './admin/components/CustomFieldGraphs';
import RegistrationFieldsToGraphs from './admin/components/RegistrationFieldsToGraphs';
import CustomFieldsStep from './citizen/components/CustomFieldsStep';

type RenderOnStepProps = {
  step: TSignUpSteps;
  children: ReactNode;
};

const RenderOnStep = ({ step, children }: RenderOnStepProps) => {
  if (step === 'custom-fields') return <>{children}</>;
  return null;
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
    'app.components.SignUpIn.SignUp.step': ({ step, ...props }) => (
      <RenderOnStep step={step}>
        <CustomFieldsStep {...props} />
      </RenderOnStep>
    ),
    'app.containers.Admin.dashboard.reports.ProjectReport.graphs': CustomFieldGraphs,
  },
};

export default configuration;
