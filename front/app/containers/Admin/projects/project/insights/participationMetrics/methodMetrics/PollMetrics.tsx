import React from 'react';

import { PollMetrics as PollMetricsType } from 'api/phase_insights/types';

import { useIntl } from 'utils/cl-intl';

import messages from '../../messages';
import MetricCard from '../MetricCard';

interface Props {
  metrics: PollMetricsType;
  showChange: boolean;
}

const PollMetrics = ({ metrics, showChange }: Props) => {
  const { formatMessage } = useIntl();

  return (
    <MetricCard
      label={formatMessage(messages.responses)}
      value={metrics.responses}
      icon="vote-ballot"
      change={showChange ? metrics.responses_7_day_percent_change : undefined}
    />
  );
};

export default PollMetrics;
