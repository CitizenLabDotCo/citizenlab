import React from 'react';

import { Box, Text, Icon, colors } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { SevenDayChange } from 'api/phase_insights/types';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

const TrendValue = styled.span<{ $isPositive: boolean; $isNeutral: boolean }>`
  font-size: 13px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 2px;
  color: ${({ $isPositive, $isNeutral }) =>
    $isNeutral
      ? colors.textSecondary
      : $isPositive
      ? colors.green500
      : colors.red500};
`;

interface Props {
  change: SevenDayChange;
}

const MetricTrend = ({ change }: Props) => {
  const { formatMessage } = useIntl();

  if (change === null || change === 'last_7_days_compared_with_zero') {
    return (
      <Box display="flex" alignItems="center" gap="6px" flexWrap="wrap">
        <Text
          as="span"
          fontSize="s"
          color="textSecondary"
          fontStyle="italic"
          m="0"
          style={{ opacity: 0.6 }}
        >
          {formatMessage(messages.noComparisonData)}
        </Text>
      </Box>
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

  return (
    <Box display="flex" alignItems="center" gap="6px" flexWrap="wrap">
      <TrendValue $isPositive={isPositive} $isNeutral={isNeutral}>
        {trendIcon && (
          <Icon
            name={trendIcon}
            width="12px"
            height="12px"
            fill={
              isNeutral
                ? colors.textSecondary
                : isPositive
                ? colors.green500
                : colors.red500
            }
          />
        )}
        {trendLabel}
      </TrendValue>
      <Text as="span" fontSize="s" color="coolGrey500" m="0">
        {formatMessage(messages.vsLast7Days)}
      </Text>
    </Box>
  );
};

export default MetricTrend;
