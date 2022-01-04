import React from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
import VerificationBadge from './citizen/components/VerificationBadge';
import VerificationModal from './citizen/components/VerificationModal';
import VerificationOnboardingStep from './citizen/components/VerificationOnboardingStep';
import VerificationSignUpSteps from './citizen/components/VerificationSignUpSteps';
import VerificationStatus from './citizen/components/VerificationStatus';

const configuration: ModuleConfiguration = {
  outlets: {
    'app.components.SignUpIn.SignUp.step': (props) => (
      <VerificationSignUpSteps {...props} />
    ),
    'app.containers.UserEditPage.content': () => <VerificationStatus />,
    'app.containers.Navbar.UserMenu.UserNameContainer': (props) => (
      <VerificationBadge {...props} />
    ),
    'app.containers.App.modals': ({ onMounted }) => {
      return <VerificationModal onMounted={onMounted} />;
    },
    'app.containers.LandingPage.onboardingCampaigns':
      VerificationOnboardingStep,
  },
};

export default configuration;
