import React from 'react';

import { VolunteeringMetrics as VolunteeringMetricsType } from 'api/phase_insights/types';

import { useIntl } from 'utils/cl-intl';

import messages from '../../messages';
import MetricCard from '../MetricCard';

interface Props {
  metrics: VolunteeringMetricsType;
  showChange: boolean;
}

const VolunteeringMetrics = ({ metrics, showChange }: Props) => {
  const { formatMessage } = useIntl();

  return (
    <MetricCard
      label={formatMessage(messages.volunteerings)}
      value={metrics.volunteerings}
      icon="user-check"
      change={
        showChange ? metrics.volunteerings_7_day_percent_change : undefined
      }
    />
  );
};

export default VolunteeringMetrics;
