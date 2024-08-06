import React from 'react';

import useAuthenticationRequirements from 'api/authentication/authentication_requirements/useAuthenticationRequirements';
import { OnboardingType } from 'api/users/types';

import { AuthenticationData } from 'containers/Authentication/typings';

import TopicsAndAreas from './TopicsAndAreas';

interface Props {
  authenticationData: AuthenticationData;
  onSubmit: (id: string, onboarding: OnboardingType) => void;
  onSkip: () => void;
}

const Onboarding = ({ authenticationData, onSubmit, onSkip }: Props) => {
  const { data: authenticationRequirements } = useAuthenticationRequirements(
    authenticationData.context
  );
  const requiresTopicsAndAreasOnboarding =
    authenticationRequirements?.data.attributes.requirements.onboarding;

  if (requiresTopicsAndAreasOnboarding) {
    return <TopicsAndAreas onSubmit={onSubmit} onSkip={onSkip} />;
  }

  return null;
};

export default Onboarding;
