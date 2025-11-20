import React from 'react';

import { ParticipationMethod } from 'api/phases/types';

import CommonGroundInsights from './CommonGroundInsights';
import NativeSurveyInsights from './NativeSurveyInsights';
import { MethodSpecificInsightProps } from './types';

/**
 * Registry mapping participation methods to their insight components
 * Add new methods incrementally as they are implemented
 */
export const methodSpecificInsightsRegistry: Partial<
  Record<ParticipationMethod, React.ComponentType<MethodSpecificInsightProps>>
> = {
  common_ground: CommonGroundInsights,
  native_survey: NativeSurveyInsights,
  // Future implementations:
  // ideation: IdeationInsights,
  // voting: VotingInsights,
  // etc.
};
