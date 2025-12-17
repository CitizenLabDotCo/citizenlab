import React from 'react';

import { Box, Text, Spinner } from '@citizenlab/cl2-component-library';

import usePhaseInsights from 'api/phase_insights/usePhaseInsights';
import { IPhaseData } from 'api/phases/types';

import { useIntl } from 'utils/cl-intl';
import { pastPresentOrFuture } from 'utils/dateUtils';

import messages from '../messages';

import MethodMetrics from './MethodMetrics';
import Metric from './Metric';

interface Props {
  phase: IPhaseData;
}

const ParticipationMetrics = ({ phase }: Props) => {
  const { formatMessage } = useIntl();
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

  return (
    <Box
      display="flex"
      flexWrap="wrap"
      alignContent="center"
      gap="24px"
      flexGrow={1}
    >
      <Metric
        label={formatMessage(messages.visitors)}
        value={metrics.visitors}
        change={isCurrentPhase ? metrics.visitors_7_day_change : undefined}
      />
      <Metric
        label={formatMessage(messages.participants)}
        value={metrics.participants}
        change={isCurrentPhase ? metrics.participants_7_day_change : undefined}
      />

      <MethodMetrics
        participationMethod={participation_method}
        metrics={metrics}
        showChange={isCurrentPhase}
      />

      <Metric
        label={formatMessage(messages.participationRate)}
        value={`${(metrics.participation_rate * 100).toFixed(1)}%`}
        change={
          isCurrentPhase ? metrics.participation_rate_7_day_change : undefined
        }
      />
    </Box>
  );
};

export default ParticipationMetrics;
