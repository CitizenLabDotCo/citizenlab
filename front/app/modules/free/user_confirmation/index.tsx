import React from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
import ConfirmationSignupStep from './citizen/components/ConfirmationSignupStep';
import ToggleUserConfirmation from './admin/components/ToggleUserConfirmation';
import useFeatureFlag from 'hooks/useFeatureFlag';
import { modifyMetaData } from 'components/SignUpIn/events';
import useAuthUser from 'hooks/useAuthUser';
import { isNilOrError } from 'utils/helperUtils';
import FeatureFlag from 'components/FeatureFlag';

export const CONFIRMATION_STEP_NAME = 'confirmation';

const configuration: ModuleConfiguration = {
  outlets: {
    'app.components.SignUpIn.SignUp.step': (props) => (
      <FeatureFlag name="user_confirmation">
        <ConfirmationSignupStep {...props} />
      </FeatureFlag>
    ),
    'app.containers.Admin.settings.registrationBeginning': (props) => (
      <FeatureFlag onlyCheckAllowed name="user_confirmation">
        <ToggleUserConfirmation {...props} />
      </FeatureFlag>
    ),
  },
};

export default configuration;
