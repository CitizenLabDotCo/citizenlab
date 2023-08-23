import React from 'react';
import { AuthenticationData } from 'containers/Authentication/typings';
import useAuthenticationRequirements from 'api/authentication/authentication_requirements/useAuthenticationRequirements';
import TopicsAndAreas from './TopicsAndAreas';
import { RequirementStatus } from 'api/authentication/authentication_requirements/types';
import useAreas from 'api/areas/useAreas';
import useTopics from 'api/topics/useTopics';

interface Props {
  authenticationData: AuthenticationData;
  onSubmit: (id: string, onboarding: Record<string, RequirementStatus>) => void;
  onSkip: () => void;
}

const Onboarding = ({ authenticationData, onSubmit, onSkip }: Props) => {
  const { data: authenticationRequirements } = useAuthenticationRequirements(
    authenticationData.context
  );
  const { data: areas } = useAreas({ forHomepageFilter: true });
  const { data: topics } = useTopics({ forHomepageFilter: true });
  const hasAreas = areas && areas.data.length > 0;
  const hasTopics = topics && topics.data.length > 0;
  const requiresTopicsAndAreasOnboarding = Object.prototype.hasOwnProperty.call(
    authenticationRequirements?.data.attributes.requirements.requirements
      .onboarding,
    'topics_and_areas'
  );

  if ((!hasAreas && !hasTopics) || !requiresTopicsAndAreasOnboarding)
    return null;

  return <TopicsAndAreas onSubmit={onSubmit} onSkip={onSkip} />;
};

export default Onboarding;
