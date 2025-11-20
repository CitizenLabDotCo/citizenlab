import React, { useMemo } from 'react';

import { Box, Text } from 'component-library';

import useParticipationMetrics from 'api/phase_insights/useParticipationMetrics';
import { IPhaseData } from 'api/phases/types';

import { useIntl, MessageDescriptor } from 'utils/cl-intl';

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
  subtext?: string;
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

  let subtext: string | undefined;
  if (config.customSubtext) {
    subtext = config.customSubtext(data, formatMessage);
  } else if (config.getChange) {
    const change = config.getChange(data);
    if (change !== undefined) {
      subtext = `${formatMessage(
        messages.last7Days
      )}: +${change.toLocaleString()}`;
    }
  }

  return {
    key: config.key,
    label: formatMessage(config.message),
    value: formattedValue,
    subtext,
  };
};

const ParticipationMetrics = ({ phase }: Props) => {
  const { formatMessage } = useIntl();
  const { participation_method } = phase.attributes;
  const { data: response } = useParticipationMetrics({
    phaseId: phase.id,
    participationMethod: participation_method,
  });

  // Transform API data into display format
  const metrics: MetricDisplay[] = useMemo(() => {
    if (!response?.data.attributes) return [];

    const metricsData = response.data.attributes;
    const result: MetricDisplay[] = [];

    // Always show visitors and participants first
    result.push(
      buildMetric(
        {
          key: 'visitors',
          message: messages.visitors,
          getValue: (d) => d.visitors,
          getChange: (d) => d.visitors_last_7_days,
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
          getChange: (d) => d.participants_last_7_days,
        },
        metricsData,
        formatMessage
      )
    );

    // Add method-specific metrics from config
    const methodConfigs = METRIC_CONFIGS[participation_method];
    const methodData = metricsData[
      participation_method as keyof typeof metricsData
    ] as Record<string, any> | undefined;

    if (methodData) {
      methodConfigs.forEach((config) => {
        result.push(buildMetric(config, methodData, formatMessage));
      });
    }

    // Always show engagement rate last
    result.push(
      buildMetric(
        {
          key: 'engagementRate',
          message: messages.engagementRate,
          getValue: (d) => `${d.engagement_rate.toFixed(1)}%`,
        },
        metricsData,
        formatMessage
      )
    );

    return result;
  }, [response, formatMessage, participation_method]);

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
          {metric.subtext && (
            <Text fontSize="s" color="textSecondary">
              {metric.subtext}
            </Text>
          )}
        </Box>
      ))}
    </Box>
  );
};

export default ParticipationMetrics;
