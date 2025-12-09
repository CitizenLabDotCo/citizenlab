import React from 'react';

import {
  Text,
  Icon,
  Box,
  IconTooltip,
} from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';
import { trendConfiguration } from './utils';

type Props = {
  percentageDifference: number | null | 'last_7_days_compared_with_zero';
  showQuarterComparisonLabel?: boolean;
  comparisonLabel?: string;
};

const TrendIndicator = ({
  percentageDifference,
  showQuarterComparisonLabel,
  comparisonLabel,
}: Props) => {
  const { formatMessage } = useIntl();

  // Show tooltip with explanatory text when null (phase < 14 days) or when comparing against zero
  if (percentageDifference === null) {
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

  if (percentageDifference === 'last_7_days_compared_with_zero') {
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

  // Determine if the percentage difference is positive, negative, or zero
  let trendType: 'positive' | 'negative' | 'zero' = 'zero';
  if (percentageDifference > 0) trendType = 'positive';
  if (percentageDifference < 0) trendType = 'negative';

  // Get the current trend configuration object based on the trend type
  const currentTrendConfig = trendConfiguration[trendType];

  // Format the percentage difference for display
  const trendPercentageLabel = `${
    percentageDifference >= 0 ? '+' : ''
  }${Math.round(percentageDifference)}%`;

  // Determine which label to show
  const labelToShow = comparisonLabel
    ? comparisonLabel
    : showQuarterComparisonLabel
    ? formatMessage(messages.lastQuarter)
    : null;

  return (
    <Box display="flex" gap="8px">
      <Text m="0px" color={currentTrendConfig.colorName} fontSize="s">
        {currentTrendConfig.icon && (
          <Icon
            mr="4px"
            width="13px"
            name={currentTrendConfig.icon}
            fill={currentTrendConfig.color}
          />
        )}
        {trendPercentageLabel}
      </Text>
      {labelToShow && (
        <Text m="0px" color="textSecondary" fontSize="s">
          {labelToShow}
        </Text>
      )}
    </Box>
  );
};

export default TrendIndicator;
