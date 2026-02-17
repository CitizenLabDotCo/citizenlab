import React from 'react';

import { Box, Text, Spinner } from '@citizenlab/cl2-component-library';

import usePhaseInsights from 'api/phase_insights/usePhaseInsights';
import { IPhaseData } from 'api/phases/types';

import { useIntl } from 'utils/cl-intl';
import { pastPresentOrFuture } from 'utils/dateUtils';

import messages from '../messages';

import MethodMetrics from './MethodMetrics';
import MetricCard from './MetricCard';

interface Props {
  phase: IPhaseData;
}

const ParticipationMetrics = ({ phase }: Props) => {
  const { formatMessage, formatNumber } = useIntl();
  const { start_at, end_at, participation_method } = phase.attributes;
  const {
    data: response,
    error,
    isLoading,
  } = usePhaseInsights({
    phaseId: phase.id,
  });

  if (isLoading) {
    return (
      <Box
        display="flex"
        flexWrap="wrap"
        alignContent="center"
        gap="24px"
        flexGrow={1}
      >
        <Spinner size="24px" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        display="flex"
        flexWrap="wrap"
        alignContent="center"
        gap="24px"
        flexGrow={1}
      >
        <Text color="error">{formatMessage(messages.errorLoadingMetrics)}</Text>
      </Box>
    );
  }

  const metrics = response.data.attributes.metrics;

  const isCurrentPhase = pastPresentOrFuture([start_at, end_at]) === 'present';

  const { participation_rate_as_percent } = metrics;

  return (
    <Box display="flex" flexWrap="wrap" gap="16px" w="100%">
      <MetricCard
        label={formatMessage(messages.visitors)}
        value={metrics.visitors}
        icon="user-circle"
        change={
          isCurrentPhase ? metrics.visitors_7_day_percent_change : undefined
        }
      />
      <MetricCard
        label={formatMessage(messages.participants)}
        value={metrics.participants}
        icon="sidebar-users"
        change={
          isCurrentPhase ? metrics.participants_7_day_percent_change : undefined
        }
        labelTooltip={formatMessage(messages.phaseParticipantsMetricTooltip2)}
      />

      <MethodMetrics
        participationMethod={participation_method}
        metrics={metrics}
        showChange={isCurrentPhase}
      />

      <MetricCard
        label={formatMessage(messages.participationRate)}
        value={
          participation_rate_as_percent ===
          'participant_count_compared_with_zero_visitors'
            ? '-'
            : formatNumber(participation_rate_as_percent / 100, {
                style: 'percent',
                minimumFractionDigits: 1,
                maximumFractionDigits: 1,
              })
        }
        icon="chart-bar"
        change={
          isCurrentPhase
            ? metrics.participation_rate_7_day_percent_change
            : undefined
        }
        labelTooltip={formatMessage(
          messages.participationRateExplanationTooltip
        )}
        valueTooltip={
          participation_rate_as_percent ===
          'participant_count_compared_with_zero_visitors'
            ? formatMessage(
                messages.cannotCalculateParticipationRateZeroVisitors
              )
            : undefined
        }
      />
    </Box>
  );
};

export default ParticipationMetrics;
