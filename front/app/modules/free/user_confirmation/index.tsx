import React, { ReactNode } from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
import ConfirmationSignupStep from './citizen/components/ConfirmationSignupStep';
import useFeatureFlag from 'hooks/useFeatureFlag';
import { modifyMetaData } from 'components/SignUpIn/events';
import useAuthUser from 'hooks/useAuthUser';
import { isNilOrError } from 'utils/helperUtils';

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
    'app.components.SignUpIn.metaData': ({ metaData }) => {
      const user = useAuthUser();
      const isUserConfirmationEnabled = useFeatureFlag('user_confirmation');

      const confirmationShouldHappen =
        isUserConfirmationEnabled &&
        !metaData?.isInvitation &&
        !metaData?.requiresConfirmation;

      const confirmationAlreadyHappened =
        !isNilOrError(user) && user?.attributes?.email_confirmed_at;

      if (confirmationShouldHappen && !confirmationAlreadyHappened) {
        modifyMetaData(metaData, { requiresConfirmation: true });
      }

      return null;
    },
  },
};

export default configuration;
