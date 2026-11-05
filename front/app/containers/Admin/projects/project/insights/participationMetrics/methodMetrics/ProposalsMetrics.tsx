import React from 'react';

import { ProposalsMetrics as ProposalsMetricsType } from 'api/phase_insights/types';

import { useIntl } from 'utils/cl-intl';

import messages from '../../messages';
import MetricCard from '../MetricCard';

interface Props {
  metrics: ProposalsMetricsType;
  showChange: boolean;
}

const ProposalsMetrics = ({ metrics, showChange }: Props) => {
  const { formatMessage } = useIntl();

  return (
    <>
      <MetricCard
        label={formatMessage(messages.inputs)}
        value={metrics.ideas_posted}
        icon="sidebar-proposals"
        change={
          showChange ? metrics.ideas_posted_7_day_percent_change : undefined
        }
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
        label={formatMessage(messages.reactions)}
        value={metrics.reactions}
        icon="thumb-up"
        change={showChange ? metrics.reactions_7_day_percent_change : undefined}
      />
    </>
  );
};

export default ProposalsMetrics;
