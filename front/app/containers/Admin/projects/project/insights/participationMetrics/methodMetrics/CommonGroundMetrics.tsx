import React from 'react';

import { CommonGroundMetrics as CommonGroundMetricsType } from 'api/phase_insights/types';

import { useIntl } from 'utils/cl-intl';

import messages from '../../messages';
import Metric from '../Metric';

interface Props {
  metrics: CommonGroundMetricsType;
  showChange: boolean;
}

const CommonGroundMetrics = ({ metrics, showChange }: Props) => {
  const { formatMessage } = useIntl();

  return (
    <>
      <Metric
        label={formatMessage(messages.ideasPosted)}
        value={metrics.ideas_posted}
        change={showChange ? metrics.ideas_posted_7_day_change : undefined}
      />
      <Metric
        label={formatMessage(messages.associatedIdeas)}
        value={metrics.associated_ideas}
      />
      <Metric
        label={formatMessage(messages.reactions)}
        value={metrics.reactions}
        change={showChange ? metrics.reactions_7_day_change : undefined}
      />
    </>
  );
};

export default CommonGroundMetrics;
