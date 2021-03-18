import React from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
import VerificationSignUpSteps from './citizen/VerificationSignUpSteps';

const configuration: ModuleConfiguration = {
  routes: {
    admin: [],
  },
  outlets: {
    'app.components.SignUpIn.SignUp.step': (props) => (
      <VerificationSignUpSteps {...props} />
    ),
  },
};

export default configuration;
