import React from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
const ConfirmationSignupStep = React.lazy(
  () => import('./citizen/components/ConfirmationSignupStep')
);

import useFeatureFlag from 'hooks/useFeatureFlag';

export const CONFIRMATION_STEP_NAME = 'confirmation';

const RenderOnFeatureFlag = ({ children }) => {
  const featureFlag = useFeatureFlag({
    name: 'user_confirmation',
  });

  return featureFlag ? <>{children}</> : null;
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
  },
};

export default configuration;
