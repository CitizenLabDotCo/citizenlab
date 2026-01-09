import React from 'react';

import { PollMetrics as PollMetricsType } from 'api/phase_insights/types';

import { useIntl } from 'utils/cl-intl';

import messages from '../../messages';
import Metric from '../Metric';

interface Props {
  metrics: PollMetricsType;
  showChange: boolean;
}

const PollMetrics = ({ metrics, showChange }: Props) => {
  const { formatMessage } = useIntl();

  return (
    <Metric
      label={formatMessage(messages.responses)}
      value={metrics.responses}
      change={showChange ? metrics.responses_7_day_change : undefined}
    />
  );
};

export default PollMetrics;
