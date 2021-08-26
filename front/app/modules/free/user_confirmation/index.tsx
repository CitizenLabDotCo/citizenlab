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
    'app.components.SignUpIn.metaData': ({ metaData }) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const user = useAuthUser();
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const isUserConfirmationEnabled = useFeatureFlag('user_confirmation');

      if (!metaData) {
        return null;
      }

      const confirmationRequired =
        !isNilOrError(user) &&
        // When we allow users to reconfirm their emails, we should stop checking for registration_completed_at.
        user?.attributes?.confirmation_required &&
        !user?.attributes?.registration_completed_at;
      if (
        confirmationRequired &&
        isUserConfirmationEnabled &&
        !metaData.requiresConfirmation
      ) {
        modifyMetaData(metaData, {
          requiresConfirmation: true,
          modalNoCloseSteps: [CONFIRMATION_STEP_NAME],
        });
      }

      return null;
    },
  },
};

export default configuration;
