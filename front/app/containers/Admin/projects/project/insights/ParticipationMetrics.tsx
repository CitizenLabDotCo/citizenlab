import React, { useMemo } from 'react';

import { Box, Text } from 'component-library';

import { SevenDayChange } from 'api/phase_insights/types';
import usePhaseInsights from 'api/phase_insights/usePhaseInsights';
import { IPhaseData } from 'api/phases/types';

import TrendIndicator from 'components/TrendIndicator';
import trendIndicatorMessages from 'components/TrendIndicator/messages';

import { useIntl, MessageDescriptor } from 'utils/cl-intl';
import { pastPresentOrFuture } from 'utils/dateUtils';

import messages from './messages';
import { METRIC_CONFIGS, MetricConfig } from './metricConfigs';

type Phase = IPhaseData;

interface Props {
  phase: Phase;
}

interface MetricDisplay {
  key: string;
  label: string;
  value: string;
  change?: SevenDayChange;
}

interface FormatMessageFn {
  (message: MessageDescriptor): string;
}

const buildMetric = <T,>(
  config: MetricConfig<T>,
  data: T,
  formatMessage: FormatMessageFn
): MetricDisplay => {
  const value = config.getValue(data);
  const formattedValue =
    typeof value === 'number' ? value.toLocaleString() : String(value);

  let change: SevenDayChange | undefined;
  if (config.getChange) {
    change = config.getChange(data);
  }

  return {
    key: config.key,
    label: formatMessage(config.message),
    value: formattedValue,
    change,
  };
};

const ParticipationMetrics = ({ phase }: Props) => {
  const { formatMessage } = useIntl();
  const { participation_method, voting_method, start_at, end_at } =
    phase.attributes;
  const { data: response } = usePhaseInsights({
    phaseId: phase.id,
  });

  // Only show 7-day change indicators for current/ongoing phases
  const isCurrentPhase = pastPresentOrFuture([start_at, end_at]) === 'present';

  // Transform API data into display format
  const metrics: MetricDisplay[] = useMemo(() => {
    if (!response?.data.attributes.metrics) return [];

    const metricsData = response.data.attributes.metrics;
    const result: MetricDisplay[] = [];

    // Always show visitors and participants first
    result.push(
      buildMetric(
        {
          key: 'visitors',
          message: messages.visitors,
          getValue: (d) => d.visitors,
          getChange: (d) => d.visitors_7_day_change,
        },
        metricsData,
        formatMessage
      )
    );

    result.push(
      buildMetric(
        {
          key: 'participants',
          message: messages.participants,
          getValue: (d) => d.participants,
          getChange: (d) => d.participants_7_day_change,
        },
        metricsData,
        formatMessage
      )
    );

    // For voting phases, use voting_method to determine configs (budgeting vs voting)
    // Backend returns data under 'voting' key but with different fields based on voting_method
    const configKey =
      participation_method === 'voting' && voting_method === 'budgeting'
        ? 'budgeting'
        : participation_method;

    // Add method-specific metrics from config
    const methodConfigs = METRIC_CONFIGS[configKey];
    const methodData = metricsData[
      participation_method as keyof typeof metricsData
    ] as Record<string, any> | undefined;

    if (methodData && methodConfigs) {
      methodConfigs.forEach((config) => {
        result.push(buildMetric(config, methodData, formatMessage));
      });
    }

    // Always show participation rate last
    // Backend returns decimal (0.75), multiply by 100 for percentage display
    result.push(
      buildMetric(
        {
          key: 'participationRate',
          message: messages.participationRate,
          getValue: (d) => `${(d.participation_rate * 100).toFixed(1)}%`,
          getChange: (d) => d.participation_rate_7_day_change,
        },
        metricsData,
        formatMessage
      )
    );

    return result;
  }, [response, formatMessage, participation_method, voting_method]);

  const comparisonLabel = formatMessage(trendIndicatorMessages.vsLast7Days);

  return (
    <Box
      display="flex"
      flexWrap="wrap"
      alignContent="center"
      gap="24px"
      flexGrow={1}
    >
      {metrics.map((metric) => (
        <Box
          key={metric.key}
          display="flex"
          flexDirection="column"
          gap="4px"
          w="130px"
        >
          <Text fontSize="s" color="primary">
            {metric.label}
          </Text>
          <Text fontSize="l" color="textPrimary">
            {metric.value}
          </Text>
          {isCurrentPhase && metric.change !== undefined && (
            <TrendIndicator
              percentageDifference={metric.change}
              comparisonLabel={comparisonLabel}
            />
          )}
        </Box>
      ))}
    </Box>
  );
};

export default ParticipationMetrics;
