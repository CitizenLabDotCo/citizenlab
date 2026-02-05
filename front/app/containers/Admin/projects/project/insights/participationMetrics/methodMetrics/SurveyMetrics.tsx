import React from 'react';

import { SurveyMetrics as SurveyMetricsType } from 'api/phase_insights/types';

import { useIntl } from 'utils/cl-intl';

import messages from '../../messages';
import MetricCard from '../MetricCard';

interface Props {
  metrics: SurveyMetricsType;
  showChange: boolean;
}

const SurveyMetrics = ({ metrics, showChange }: Props) => {
  const { formatMessage, formatNumber } = useIntl();

  const { completion_rate_as_percent } = metrics;

  return (
    <>
      <MetricCard
        label={formatMessage(messages.submissions)}
        value={metrics.surveys_submitted}
        icon="check-circle"
        change={
          showChange
            ? metrics.surveys_submitted_7_day_percent_change
            : undefined
        }
      />
      <MetricCard
        label={formatMessage(messages.completionRate)}
        value={
          completion_rate_as_percent ===
          'submitted_count_compared_with_zero_ideas'
            ? '-'
            : formatNumber(completion_rate_as_percent / 100, {
                style: 'percent',
                minimumFractionDigits: 1,
                maximumFractionDigits: 1,
              })
        }
        icon="chart-bar"
        change={
          showChange ? metrics.completion_rate_7_day_percent_change : undefined
        }
        labelTooltip={formatMessage(messages.completionRateExplanationTooltip)}
        valueTooltip={
          completion_rate_as_percent ===
          'submitted_count_compared_with_zero_ideas'
            ? formatMessage(
                messages.cannotCalculateCompletionRateNoSurveyResponses
              )
            : undefined
        }
      />
    </>
  );
};

export default SurveyMetrics;
