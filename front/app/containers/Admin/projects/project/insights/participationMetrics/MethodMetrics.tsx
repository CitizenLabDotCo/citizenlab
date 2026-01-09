import React from 'react';

import { PhaseInsightsParticipationMetrics } from 'api/phase_insights/types';
import { ParticipationMethod } from 'api/phases/types';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

import Metric from './Metric';

interface Props {
  participationMethod: ParticipationMethod;
  metrics: PhaseInsightsParticipationMetrics;
  showChange: boolean;
}

const MethodMetrics = ({ participationMethod, metrics, showChange }: Props) => {
  const { formatMessage } = useIntl();

  switch (participationMethod) {
    case 'ideation': {
      const ideationMetrics = metrics.ideation;
      if (!ideationMetrics) return null;
      return (
        <>
          <Metric
            label={formatMessage(messages.inputs)}
            value={ideationMetrics.ideas_posted}
            change={
              showChange ? ideationMetrics.ideas_posted_7_day_change : undefined
            }
          />
          <Metric
            label={formatMessage(messages.comments)}
            value={ideationMetrics.comments_posted}
            change={
              showChange
                ? ideationMetrics.comments_posted_7_day_change
                : undefined
            }
          />
          <Metric
            label={formatMessage(messages.reactions)}
            value={ideationMetrics.reactions}
            change={
              showChange ? ideationMetrics.reactions_7_day_change : undefined
            }
          />
        </>
      );
    }
    case 'proposals': {
      const proposalsMetrics = metrics.proposals;
      if (!proposalsMetrics) return null;
      return (
        <>
          <Metric
            label={formatMessage(messages.inputs)}
            value={proposalsMetrics.ideas_posted}
            change={
              showChange
                ? proposalsMetrics.ideas_posted_7_day_change
                : undefined
            }
          />
          <Metric
            label={formatMessage(messages.comments)}
            value={proposalsMetrics.comments_posted}
            change={
              showChange
                ? proposalsMetrics.comments_posted_7_day_change
                : undefined
            }
          />
          <Metric
            label={formatMessage(messages.reactions)}
            value={proposalsMetrics.reactions}
            change={
              showChange ? proposalsMetrics.reactions_7_day_change : undefined
            }
          />
        </>
      );
    }
    case 'native_survey':
    case 'survey': {
      const surveyMetrics = metrics.native_survey || metrics.survey;
      if (!surveyMetrics) return null;
      return (
        <>
          <Metric
            label={formatMessage(messages.submissions)}
            value={surveyMetrics.surveys_submitted}
            change={
              showChange
                ? surveyMetrics.surveys_submitted_7_day_change
                : undefined
            }
          />
          <Metric
            label={formatMessage(messages.completionRate)}
            value={`${(surveyMetrics.completion_rate * 100).toFixed(1)}%`}
            change={
              showChange
                ? surveyMetrics.completion_rate_7_day_change
                : undefined
            }
          />
        </>
      );
    }
    case 'poll': {
      const pollMetrics = metrics.poll;
      if (!pollMetrics) return null;
      return (
        <Metric
          label={formatMessage(messages.responses)}
          value={pollMetrics.responses}
          change={showChange ? pollMetrics.responses_7_day_change : undefined}
        />
      );
    }
    case 'common_ground': {
      const commonGroundMetrics = metrics.common_ground;
      if (!commonGroundMetrics) return null;
      return (
        <>
          <Metric
            label={formatMessage(messages.ideasPosted)}
            value={commonGroundMetrics.ideas_posted}
            change={
              showChange
                ? commonGroundMetrics.ideas_posted_7_day_change
                : undefined
            }
          />
          <Metric
            label={formatMessage(messages.associatedIdeas)}
            value={commonGroundMetrics.associated_ideas}
          />
          <Metric
            label={formatMessage(messages.reactions)}
            value={commonGroundMetrics.reactions}
            change={
              showChange
                ? commonGroundMetrics.reactions_7_day_change
                : undefined
            }
          />
        </>
      );
    }
    case 'volunteering': {
      const volunteeringMetrics = metrics.volunteering;
      if (!volunteeringMetrics) return null;
      return (
        <Metric
          label={formatMessage(messages.volunteerings)}
          value={volunteeringMetrics.volunteerings}
          change={
            showChange
              ? volunteeringMetrics.volunteerings_7_day_change
              : undefined
          }
        />
      );
    }
    default:
      return null;
  }
};

export default MethodMetrics;
