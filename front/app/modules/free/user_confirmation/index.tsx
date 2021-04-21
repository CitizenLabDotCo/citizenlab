import React, { ReactNode } from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
import ConfirmationSignupStep from './citizen/components/ConfirmationSignupStep';
import useFeatureFlag from 'hooks/useFeatureFlag';
import { modifyMetaData } from 'components/SignUpIn/events';

type RenderOnFeatureFlagProps = {
  children: ReactNode;
};

const RenderOnFeatureFlag = ({ children }: RenderOnFeatureFlagProps) => {
  const isUserConfirmationEnabled = useFeatureFlag('user_confirmation');

  if (isUserConfirmationEnabled) {
    return <>{children}</>;
  }
  return null;
};

const configuration: ModuleConfiguration = {
  outlets: {
    'app.components.SignUpIn.SignUp.step': (props) => (
      <RenderOnFeatureFlag>
        <ConfirmationSignupStep {...props} />
      </RenderOnFeatureFlag>
    ),
    'app.components.SignUpIn.metaData': ({ onData, metaData }) => {
      const isUserConfirmationEnabled = useFeatureFlag('user_confirmation');

      if (
        isUserConfirmationEnabled &&
        !metaData?.isInvitation &&
        !metaData?.confirmation
      ) {
        modifyMetaData(metaData, { confirmation: true });
      }

      return null;
    },
  },
};

export default configuration;
