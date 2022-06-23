import React from 'react';
import {
  TVerificationMethod,
  TVerificationMethodName,
} from 'services/verificationMethods';
import { ModuleConfiguration } from 'utils/moduleUtils';
import VerificationBadge from './citizen/components/VerificationBadge';
import VerificationModal from './citizen/components/VerificationModal';
import VerificationOnboardingStep from './citizen/components/VerificationOnboardingStep';
import VerificationSignUpStep from './citizen/components/VerificationSignUpStep';
import VerificationStatus from './citizen/components/VerificationStatus';

export function isLastVerificationMethod(
  verificationMethodName: TVerificationMethodName,
  verificationMethods: TVerificationMethod[]
) {
  return (
    verificationMethods
      .map((vm) => vm.attributes.name)
      .indexOf(verificationMethodName) ===
    verificationMethods.length - 1
  );
}

const configuration: ModuleConfiguration = {
  outlets: {
    'app.components.SignUpIn.SignUp.step': (props) => (
      <VerificationSignUpStep {...props} />
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
