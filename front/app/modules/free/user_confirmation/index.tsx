import useFeatureFlag from 'hooks/useFeatureFlag';
import React from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
import ToggleUserConfirmation from './admin/components/ToggleUserConfirmation';
import ConfirmationSignupStep from './citizen/components/ConfirmationSignupStep';

export const CONFIRMATION_STEP_NAME = 'confirmation';

const RenderOnFeatureFlag = ({ children }) => {
  const featureFlag = useFeatureFlag({
    name: 'user_confirmation',
  });

  return featureFlag ? <>{children}</> : null;
};

const RenderOnAllowed = ({ children }) => {
  const allowed = useFeatureFlag({
    name: 'user_confirmation',
    onlyCheckAllowed: true,
  });

  return allowed ? <>{children}</> : null;
};

const configuration: ModuleConfiguration = {
  outlets: {
    'app.components.SignUpIn.SignUp.step': (props) => {
      return (
        <RenderOnFeatureFlag>
          <ConfirmationSignupStep {...props} />
        </RenderOnFeatureFlag>
      );
    },

    'app.containers.Admin.settings.registrationSectionEnd': ({
      userConfirmationSetting,
      onSettingChange,
    }) => {
      return userConfirmationSetting ? (
        <RenderOnAllowed>
          <ToggleUserConfirmation
            userConfirmationSetting={userConfirmationSetting}
            onSettingChange={onSettingChange}
          />
        </RenderOnAllowed>
      ) : null;
    },
  },
};

export default configuration;
