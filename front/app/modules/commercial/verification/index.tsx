import React from 'react';
import {
  TVerificationMethod,
  TVerificationMethodName,
} from 'services/verificationMethods';
import { ModuleConfiguration } from 'utils/moduleUtils';
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
    'app.containers.HomePage.onboardingCampaigns': VerificationOnboardingStep,
  },
};

export default configuration;
