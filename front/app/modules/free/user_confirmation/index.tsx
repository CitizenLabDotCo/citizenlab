import React from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
import ConfirmationSignupStep from './citizen/components/ConfirmationSignupStep';
import ToggleUserConfirmation from './admin/components/ToggleUserConfirmation';
import useFeatureFlag from 'hooks/useFeatureFlag';

export const CONFIRMATION_STEP_NAME = 'confirmation';

const configuration: ModuleConfiguration = {
  outlets: {
    'app.components.SignUpIn.SignUp.step': (props) => {
      const enabled = useFeatureFlag({
        name: 'user_confirmation',
      });
      return enabled ? <ConfirmationSignupStep {...props} /> : null;
    },

    'app.containers.Admin.settings.registrationSectionEnd': ({
      userConfirmationSetting,
      onSettingChange,
    }) => {
      const allowed = useFeatureFlag({
        name: 'user_confirmation',
        onlyCheckAllowed: true,
      });

      if (allowed) {
        return userConfirmationSetting ? (
          <ToggleUserConfirmation
            userConfirmationSetting={userConfirmationSetting}
            onSettingChange={onSettingChange}
          />
        ) : null;
      }

      return null;
    },
  },
};

export default configuration;
