import React from 'react';

import { PhaseInsightsParticipationMetrics } from 'api/phase_insights/types';
import { ParticipationMethod } from 'api/phases/types';

import CommonGroundMetrics from './methodMetrics/CommonGroundMetrics';
import IdeationMetrics from './methodMetrics/IdeationMetrics';
import PollMetrics from './methodMetrics/PollMetrics';
import ProposalsMetrics from './methodMetrics/ProposalsMetrics';
import SurveyMetrics from './methodMetrics/SurveyMetrics';
import VolunteeringMetrics from './methodMetrics/VolunteeringMetrics';

interface Props {
  participationMethod: ParticipationMethod;
  metrics: PhaseInsightsParticipationMetrics;
  showChange: boolean;
}

const MethodMetrics = ({ participationMethod, metrics, showChange }: Props) => {
  switch (participationMethod) {
    case 'ideation': {
      const ideationMetrics = metrics.ideation;
      if (!ideationMetrics) return null;
      return (
        <IdeationMetrics metrics={ideationMetrics} showChange={showChange} />
      );
    }
    case 'proposals': {
      const proposalsMetrics = metrics.proposals;
      if (!proposalsMetrics) return null;
      return (
        <ProposalsMetrics metrics={proposalsMetrics} showChange={showChange} />
      );
    }
    case 'native_survey':
    case 'survey': {
      const surveyMetrics = metrics.native_survey || metrics.survey;
      if (!surveyMetrics) return null;
      return <SurveyMetrics metrics={surveyMetrics} showChange={showChange} />;
    }
    case 'poll': {
      const pollMetrics = metrics.poll;
      if (!pollMetrics) return null;
      return <PollMetrics metrics={pollMetrics} showChange={showChange} />;
    }
    case 'common_ground': {
      const commonGroundMetrics = metrics.common_ground;
      if (!commonGroundMetrics) return null;
      return (
        <CommonGroundMetrics
          metrics={commonGroundMetrics}
          showChange={showChange}
        />
      );
    }
    case 'volunteering': {
      const volunteeringMetrics = metrics.volunteering;
      if (!volunteeringMetrics) return null;
      return (
        <VolunteeringMetrics
          metrics={volunteeringMetrics}
          showChange={showChange}
        />
      );
    }
    default:
      return null;
  }
};

export default MethodMetrics;
