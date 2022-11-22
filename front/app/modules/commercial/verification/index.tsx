import React from 'react';
import {
  TVerificationMethod,
  TVerificationMethodName,
} from 'services/verificationMethods';
import { ModuleConfiguration } from 'utils/moduleUtils';
const VerificationBadge = React.lazy(
  () => import('./citizen/components/VerificationBadge')
);
const VerificationModal = React.lazy(
  () => import('./citizen/components/VerificationModal')
);
const VerificationOnboardingStep = React.lazy(
  () => import('./citizen/components/VerificationOnboardingStep')
);

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
    'app.containers.Navbar.UserMenu.UserNameContainer': (props) => (
      <VerificationBadge {...props} />
    ),
    'app.containers.App.modals': ({ onMounted }) => {
      return <VerificationModal onMounted={onMounted} />;
    },
    'app.containers.HomePage.onboardingCampaigns': VerificationOnboardingStep,
  },
};

export default configuration;
