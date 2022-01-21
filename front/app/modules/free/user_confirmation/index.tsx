import React from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
import ConfirmationSignupStep from './citizen/components/ConfirmationSignupStep';
import ToggleUserConfirmation from './admin/components/ToggleUserConfirmation';
import FeatureFlag from 'components/FeatureFlag';

export const CONFIRMATION_STEP_NAME = 'confirmation';

const configuration: ModuleConfiguration = {
  outlets: {
    'app.components.SignUpIn.SignUp.step': (props) => (
      <FeatureFlag name="user_confirmation">
        <ConfirmationSignupStep {...props} />
      </FeatureFlag>
    ),
    'app.containers.Admin.settings.registrationSectionEnd': ({
      userConfirmationSetting,
      onSettingChange,
    }) => {
      return userConfirmationSetting ? (
        <FeatureFlag onlyCheckAllowed name="user_confirmation">
          <ToggleUserConfirmation
            userConfirmationSetting={userConfirmationSetting}
            onSettingChange={onSettingChange}
          />
        </FeatureFlag>
      ) : null;
    },
  },
};

export default configuration;
