import React from 'react';

import { ProposalsMetrics as ProposalsMetricsType } from 'api/phase_insights/types';

import { useIntl } from 'utils/cl-intl';

import messages from '../../messages';
import Metric from '../Metric';

interface Props {
  metrics: ProposalsMetricsType;
  showChange: boolean;
}

const ProposalsMetrics = ({ metrics, showChange }: Props) => {
  const { formatMessage } = useIntl();

  return (
    <>
      <Metric
        label={formatMessage(messages.inputs)}
        value={metrics.ideas_posted}
        change={showChange ? metrics.ideas_posted_7_day_change : undefined}
      />
      <Metric
        label={formatMessage(messages.comments)}
        value={metrics.comments_posted}
        change={showChange ? metrics.comments_posted_7_day_change : undefined}
      />
      <Metric
        label={formatMessage(messages.reactions)}
        value={metrics.reactions}
        change={showChange ? metrics.reactions_7_day_change : undefined}
      />
    </>
  );
};

export default ProposalsMetrics;
