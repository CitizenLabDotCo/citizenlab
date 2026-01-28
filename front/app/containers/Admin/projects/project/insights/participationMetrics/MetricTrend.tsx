import React from 'react';

import {
  Box,
  Text,
  Icon,
  Tooltip,
  colors,
  Color,
} from '@citizenlab/cl2-component-library';

import { SevenDayChange } from 'api/phase_insights/types';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

interface Props {
  change: SevenDayChange;
}

const MetricTrend = ({ change }: Props) => {
  const { formatMessage } = useIntl();

  if (change === null || change === 'last_7_days_compared_with_zero') {
    const tooltipMessage =
      change === null
        ? messages.insufficientComparisonDataPhaseTooNew
        : messages.insufficientComparisonDataNoPriorActivity;

    return (
      <Tooltip content={formatMessage(tooltipMessage)} placement="top">
        <Box
          display="flex"
          alignItems="center"
          gap="6px"
          flexWrap="wrap"
          opacity={0.6}
        >
          <Text
            as="span"
            fontSize="s"
            color="textSecondary"
            fontStyle="italic"
            m="0"
          >
            {formatMessage(messages.insufficientComparisonData)}
          </Text>
        </Box>
      </Tooltip>
    );
  }

  const isPositive = change > 0;
  const isNeutral = change === 0;
  const trendIcon = isPositive
    ? 'arrow-up'
    : isNeutral
    ? undefined
    : 'arrow-down';
  const trendLabel = `${isPositive ? '+' : ''}${Math.round(change)}%`;
  const trendColor: Color = isNeutral
    ? 'textSecondary'
    : isPositive
    ? 'green500'
    : 'red500';

  return (
    <Box display="flex" alignItems="center" gap="6px" flexWrap="wrap">
      <Box display="flex" alignItems="center" gap="2px">
        {trendIcon && (
          <Icon
            name={trendIcon}
            width="12px"
            height="12px"
            fill={colors[trendColor]}
          />
        )}
        <Text
          as="span"
          fontSize="xs"
          fontWeight="bold"
          color={trendColor}
          m="0"
        >
          {trendLabel}
        </Text>
      </Box>
      <Text as="span" fontSize="s" color="coolGrey500" m="0">
        {formatMessage(messages.vsLast7Days)}
      </Text>
    </Box>
  );
};

export default MetricTrend;
