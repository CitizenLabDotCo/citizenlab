import React from 'react';
import { AuthenticationData } from 'containers/Authentication/typings';
import useAuthenticationRequirements from 'api/authentication/authentication_requirements/useAuthenticationRequirements';
import TopicsAndAreas from './TopicsAndAreas';
import { RequirementStatus } from 'api/authentication/authentication_requirements/types';

interface Props {
  authenticationData: AuthenticationData;
  onSubmit: (id: string, onboarding: Record<string, RequirementStatus>) => void;
  onSkip: () => void;
}

const Onboarding = ({ authenticationData, onSubmit, onSkip }: Props) => {
  const { data: authenticationRequirements } = useAuthenticationRequirements(
    authenticationData.context
  );

  if (
    Object.prototype.hasOwnProperty.call(
      authenticationRequirements?.data.attributes.requirements.requirements
        .onboarding,
      'topics_and_areas'
    )
  ) {
    return <TopicsAndAreas onSubmit={onSubmit} onSkip={onSkip} />;
  }

  return null;
};

export default Onboarding;
