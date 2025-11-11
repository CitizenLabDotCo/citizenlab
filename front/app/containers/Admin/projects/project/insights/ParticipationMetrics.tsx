import React, { useMemo } from 'react';

import { Box, Text } from 'component-library';

import useParticipationMetrics from 'api/phase_insights/useParticipationMetrics';
import { IPhaseData } from 'api/phases/types';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

interface Props {
  phase: IPhaseData;
}

interface MetricDisplay {
  key: string;
  label: string;
  value: string;
  subtext?: string;
}

const ParticipationMetrics = ({ phase }: Props) => {
  const { formatMessage } = useIntl();
  const { data: response } = useParticipationMetrics({
    phaseId: phase.id,
    participationMethod: phase.attributes.participation_method,
  });

  // Transform API data into display format
  const metrics: MetricDisplay[] = useMemo(() => {
    if (!response?.data.attributes) return [];
    const metricsData = response.data.attributes;
    const result: MetricDisplay[] = [];

    // Always show visitors and participants
    result.push({
      key: 'visitors',
      label: formatMessage(messages.visitors),
      value: metricsData.visitors.toLocaleString(),
      subtext: metricsData.visitors_change
        ? `${formatMessage(
            messages.lastWeek
          )}: +${metricsData.visitors_change.toLocaleString()}`
        : undefined,
    });

    result.push({
      key: 'participants',
      label: formatMessage(messages.participants),
      value: metricsData.participants.toLocaleString(),
      subtext: metricsData.participants_change
        ? `${formatMessage(
            messages.lastWeek
          )}: ${metricsData.participants_change.toLocaleString()}`
        : undefined,
    });

    // Method-specific metrics
    if (metricsData.ideas !== undefined) {
      result.push({
        key: 'ideas',
        label: formatMessage(messages.inputs),
        value: metricsData.ideas.toLocaleString(),
        subtext: metricsData.ideas_change
          ? `${formatMessage(
              messages.lastWeek
            )}: +${metricsData.ideas_change.toLocaleString()}`
          : undefined,
      });
    }

    if (metricsData.comments !== undefined) {
      result.push({
        key: 'comments',
        label: formatMessage(messages.comments),
        value: metricsData.comments.toLocaleString(),
        subtext: metricsData.comments_change
          ? `${formatMessage(
              messages.lastWeek
            )}: +${metricsData.comments_change.toLocaleString()}`
          : undefined,
      });
    }

    if (metricsData.reactions !== undefined) {
      result.push({
        key: 'reactions',
        label: formatMessage(messages.reactions),
        value: metricsData.reactions.toLocaleString(),
        subtext: metricsData.reactions_change
          ? `${formatMessage(
              messages.lastWeek
            )}: +${metricsData.reactions_change.toLocaleString()}`
          : undefined,
      });
    }

    if (metricsData.votes !== undefined && !metricsData.votes_per_person) {
      result.push({
        key: 'votes',
        label: formatMessage(messages.votes),
        value: metricsData.votes.toLocaleString(),
        subtext: metricsData.votes_change
          ? `${formatMessage(
              messages.lastWeek
            )}: +${metricsData.votes_change.toLocaleString()}`
          : undefined,
      });
    }

    if (metricsData.votes_per_person !== undefined) {
      result.push({
        key: 'votes',
        label: formatMessage(messages.votes),
        value: metricsData.votes!.toLocaleString(),
        subtext: metricsData.votes_change
          ? `${formatMessage(
              messages.lastWeek
            )}: +${metricsData.votes_change.toLocaleString()}`
          : undefined,
      });

      result.push({
        key: 'votesPerPerson',
        label: formatMessage(messages.votesPerPerson),
        value: metricsData.votes_per_person.toFixed(1),
        subtext: `${formatMessage(
          messages.total
        )}: ${metricsData.votes!.toLocaleString()}`,
      });
    }

    if (metricsData.submissions !== undefined) {
      result.push({
        key: 'submissions',
        label: formatMessage(messages.submissions),
        value: metricsData.submissions.toLocaleString(),
        subtext: metricsData.submissions_change
          ? `${formatMessage(
              messages.lastWeek
            )}: +${metricsData.submissions_change.toLocaleString()}`
          : undefined,
      });
    }

    if (metricsData.completion_rate !== undefined) {
      result.push({
        key: 'completionRate',
        label: formatMessage(messages.completionRate),
        value: `${metricsData.completion_rate.toFixed(1)}%`,
        subtext: undefined,
      });
    }

    result.push({
      key: 'engagementRate',
      label: formatMessage(messages.engagementRate),
      value: `${metricsData.engagement_rate.toFixed(1)}%`,
      subtext: undefined,
    });

    return result;
  }, [response, formatMessage]);

  return (
    <Box
      display="flex"
      flexWrap="wrap"
      alignContent="center"
      gap="24px"
      flexGrow={1}
    >
      {metrics.map((metric) => (
        <Box
          key={metric.key}
          display="flex"
          flexDirection="column"
          gap="4px"
          w="130px"
        >
          <Text fontSize="s" color="primary">
            {metric.label}
          </Text>
          <Text fontSize="l" color="textPrimary">
            {metric.value}
          </Text>
          {metric.subtext && (
            <Text fontSize="s" color="textSecondary">
              {metric.subtext}
            </Text>
          )}
        </Box>
      ))}
    </Box>
  );
};

export default ParticipationMetrics;
