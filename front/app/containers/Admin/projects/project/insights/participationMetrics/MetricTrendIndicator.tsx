import React from 'react';

import {
  Text,
  Icon,
  Box,
  IconTooltip,
  colors,
} from '@citizenlab/cl2-component-library';

import { SevenDayChange } from 'api/phase_insights/types';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

interface Props {
  change: SevenDayChange;
}

const getTrendConfig = (change: number) => {
  if (change > 0) {
    return { icon: 'trend-up' as const, color: colors.green500 };
  }
  if (change < 0) {
    return { icon: 'trend-down' as const, color: colors.red400 };
  }
  return { icon: undefined, color: colors.textSecondary };
};

const MetricTrendIndicator = ({ change }: Props) => {
  const { formatMessage } = useIntl();

  if (change === null) {
    return (
      <Box display="flex" alignItems="center" gap="4px">
        <Text m="0px" color="textSecondary" fontSize="s">
          {formatMessage(messages.noComparisonData)}
        </Text>
        <IconTooltip
          content={formatMessage(messages.comparisonAvailableAfter14Days)}
          icon="info-outline"
        />
      </Box>
    );
  }

  if (change === 'last_7_days_compared_with_zero') {
    return (
      <Box display="flex" alignItems="center" gap="4px">
        <Text m="0px" color="textSecondary" fontSize="s">
          {formatMessage(messages.noComparisonData)}
        </Text>
        <IconTooltip
          content={formatMessage(messages.firstActivityWithinLast7Days)}
          icon="info-outline"
        />
      </Box>
    );
  }

  const { icon, color } = getTrendConfig(change);
  const trendPercentageLabel = `${change >= 0 ? '+' : ''}${Math.round(
    change
  )}%`;

  return (
    <Box display="flex" gap="8px">
      <Text m="0px" style={{ color }} fontSize="s">
        {icon && (
          <Icon mr="4px" width="12px" height="12px" name={icon} fill={color} />
        )}
        {trendPercentageLabel}
      </Text>
      <Text m="0px" color="textSecondary" fontSize="s">
        {formatMessage(messages.vsLast7Days)}
      </Text>
    </Box>
  );
};

export default MetricTrendIndicator;
