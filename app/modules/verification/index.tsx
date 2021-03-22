import React from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
import VerificationSignUpSteps from './citizen/components/VerificationSignUpSteps';
import VerificationStatus from './citizen/components/VerificationStatus';

const configuration: ModuleConfiguration = {
  routes: {
    admin: [],
  },
  outlets: {
    'app.components.SignUpIn.SignUp.step': (props) => (
      <VerificationSignUpSteps {...props} />
    ),
    'app.containers.UserEditPage.content': () => <VerificationStatus />,
    'app.containers.Navbar.UserMenu.UserNameContainer': () => null,
  },
};

export default configuration;
