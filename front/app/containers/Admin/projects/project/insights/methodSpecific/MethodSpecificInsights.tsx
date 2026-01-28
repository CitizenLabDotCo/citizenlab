import React from 'react';

import { ParticipationMethod } from 'api/phases/types';

import CommonGroundInsights from './commonGround/CommonGroundInsights';
import IdeationInsights from './ideation/IdeationInsights';
import NativeSurveyInsights from './nativeSurvey/NativeSurveyInsights';
import ProposalsInsights from './proposals/ProposalsInsights';
import VotingInsights from './voting/VotingInsights';

interface Props {
  phaseId: string;
  participationMethod: ParticipationMethod;
}

const MethodSpecificInsights = ({ phaseId, participationMethod }: Props) => {
  switch (participationMethod) {
    case 'common_ground':
      return <CommonGroundInsights phaseId={phaseId} />;
    case 'native_survey':
      return <NativeSurveyInsights phaseId={phaseId} />;
    case 'ideation':
      return <IdeationInsights phaseId={phaseId} />;
    case 'proposals':
      return <ProposalsInsights phaseId={phaseId} />;
    case 'voting':
      return <VotingInsights phaseId={phaseId} />;
    default:
      return null;
  }
};

export default MethodSpecificInsights;
