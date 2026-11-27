import React from 'react';

import useCauses from 'api/causes/useCauses';
import { VolunteeringMetrics as VolunteeringMetricsType } from 'api/phase_insights/types';

import { useIntl } from 'utils/cl-intl';

import messages from '../../messages';
import MetricCard from '../MetricCard';

interface Props {
  metrics: VolunteeringMetricsType;
  // Set in the redesigned workspace only, which adds the causes tile.
  phaseId?: string;
  showChange: boolean;
}

const VolunteeringMetrics = ({ metrics, phaseId, showChange }: Props) => {
  const { formatMessage } = useIntl();
  const { data: causes } = useCauses({ phaseId: phaseId ?? null });

  return (
    <>
      <MetricCard
        label={formatMessage(messages.volunteerings)}
        value={metrics.volunteerings}
        icon="user-check"
        change={
          showChange ? metrics.volunteerings_7_day_percent_change : undefined
        }
      />
      {phaseId && (
        <MetricCard
          label={formatMessage(messages.causes)}
          value={causes?.data.length ?? '-'}
          icon="volunteer"
        />
      )}
    </>
  );
};

export default VolunteeringMetrics;
