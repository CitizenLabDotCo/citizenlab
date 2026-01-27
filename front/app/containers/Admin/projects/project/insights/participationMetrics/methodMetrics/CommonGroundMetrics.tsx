import React from 'react';

import { CommonGroundMetrics as CommonGroundMetricsType } from 'api/phase_insights/types';

import { useIntl } from 'utils/cl-intl';

import messages from '../../messages';
import MetricCard from '../MetricCard';

interface Props {
  metrics: CommonGroundMetricsType;
  showChange: boolean;
}

const CommonGroundMetrics = ({ metrics, showChange }: Props) => {
  const { formatMessage } = useIntl();

  return (
    <>
      <MetricCard
        label={formatMessage(messages.ideasPosted)}
        value={metrics.ideas_posted}
        icon="blank-paper"
        change={
          showChange ? metrics.ideas_posted_7_day_percent_change : undefined
        }
      />
      <MetricCard
        label={formatMessage(messages.associatedIdeas)}
        value={metrics.associated_ideas}
        icon="sidebar-folder"
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

export default CommonGroundMetrics;
