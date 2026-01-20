import React from 'react';

import { VolunteeringMetrics as VolunteeringMetricsType } from 'api/phase_insights/types';

import { useIntl } from 'utils/cl-intl';

import messages from '../../messages';
import Metric from '../Metric';

interface Props {
  metrics: VolunteeringMetricsType;
  showChange: boolean;
}

const VolunteeringMetrics = ({ metrics, showChange }: Props) => {
  const { formatMessage } = useIntl();

  return (
    <Metric
      label={formatMessage(messages.volunteerings)}
      value={metrics.volunteerings}
      change={showChange ? metrics.volunteerings_7_day_change : undefined}
    />
  );
};

export default VolunteeringMetrics;
