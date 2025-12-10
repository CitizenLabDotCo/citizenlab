import React from 'react';

import { ParticipationMethod } from 'api/phases/types';

import CommonGroundInsights from './commonGround/CommonGroundInsights';
import IdeationInsights from './ideation/IdeationInsights';
import NativeSurveyInsights from './nativeSurvey/NativeSurveyInsights';
import ProposalsInsights from './proposals/ProposalsInsights';
import { MethodSpecificInsightProps } from './types';
import VotingInsights from './voting/VotingInsights';

/**
 * Registry mapping participation methods to their insight components
 * Add new methods incrementally as they are implemented
 */
export const methodSpecificInsightsRegistry: Partial<
  Record<ParticipationMethod, React.ComponentType<MethodSpecificInsightProps>>
> = {
  common_ground: CommonGroundInsights,
  native_survey: NativeSurveyInsights,
  ideation: IdeationInsights,
  proposals: ProposalsInsights,
  voting: VotingInsights,
};
