import React from 'react';

import { VotingMetrics as VotingMetricsType } from 'api/phase_insights/types';

import { useIntl } from 'utils/cl-intl';

import messages from '../../messages';
import MetricCard from '../MetricCard';

interface Props {
  metrics: VotingMetricsType;
  showChange: boolean;
}

const VotingMetrics = ({ metrics, showChange }: Props) => {
  const { formatMessage } = useIntl();

  return (
    <>
      <MetricCard
        label={formatMessage(messages.inputs)}
        value={metrics.associated_ideas}
        icon="blank-paper"
      />
      <MetricCard
        label={formatMessage(messages.comments)}
        value={metrics.comments_posted}
        icon="chat-bubble"
        change={
          showChange ? metrics.comments_posted_7_day_percent_change : undefined
        }
      />
      <MetricCard
        label={formatMessage(messages.voters)}
        value={metrics.voters}
        icon="user-check"
        change={showChange ? metrics.voters_7_day_percent_change : undefined}
      />
    </>
  );
};

export default VotingMetrics;
