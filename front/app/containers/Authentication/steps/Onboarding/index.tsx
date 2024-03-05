import React from 'react';

import { OnboardingType } from 'api/authentication/authentication_requirements/types';
import useAuthenticationRequirements from 'api/authentication/authentication_requirements/useAuthenticationRequirements';

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
  const requiresTopicsAndAreasOnboarding = Object.prototype.hasOwnProperty.call(
    authenticationRequirements?.data.attributes.requirements.requirements
      .onboarding,
    'topics_and_areas'
  );

  if (requiresTopicsAndAreasOnboarding) {
    return <TopicsAndAreas onSubmit={onSubmit} onSkip={onSkip} />;
  }

  return null;
};

export default Onboarding;
