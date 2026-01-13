import React from 'react';

import { SurveyMetrics as SurveyMetricsType } from 'api/phase_insights/types';

import { useIntl } from 'utils/cl-intl';

import messages from '../../messages';
import Metric from '../Metric';

interface Props {
  metrics: SurveyMetricsType;
  showChange: boolean;
}

const SurveyMetrics = ({ metrics, showChange }: Props) => {
  const { formatMessage } = useIntl();

  return (
    <>
      <Metric
        label={formatMessage(messages.submissions)}
        value={metrics.surveys_submitted}
        change={showChange ? metrics.surveys_submitted_7_day_change : undefined}
      />
      <Metric
        label={formatMessage(messages.completionRate)}
        value={`${(metrics.completion_rate * 100).toFixed(1)}%`}
        change={showChange ? metrics.completion_rate_7_day_change : undefined}
      />
    </>
  );
};

export default SurveyMetrics;
