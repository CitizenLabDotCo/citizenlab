import React from 'react';

import { Text, Icon, Box } from '@citizenlab/cl2-component-library';

import { ScreenReaderOnly } from 'utils/a11y';
import { useIntl } from 'utils/cl-intl';

import messages from './messages';
import { trendConfiguration } from './utils';

type Props = {
  percentageDifference: number | null;
  showQuarterComparisonLabel?: boolean;
};

const TrendIndicator = ({
  percentageDifference,
  showQuarterComparisonLabel,
}: Props) => {
  const { formatMessage } = useIntl();

  if (percentageDifference === null) return null;

  // Determine if the percentage difference is positive, negative, or zero
  let trendType = 'zero';
  if (percentageDifference > 0) trendType = 'positive';
  if (percentageDifference < 0) trendType = 'negative';

  // Get the current trend configuration object based on the trend type
  const currentTrendConfig = trendConfiguration[trendType];

  // Format the percentage difference for display
  const trendPercentageLabel = `${
    percentageDifference >= 0 ? '+' : ''
  }${Math.round(percentageDifference)}%`;

  // Screen-reader friendly description of the trend
  const absPercentage = Math.abs(Math.round(percentageDifference));
  const trendMessage =
    trendType === 'positive'
      ? formatMessage(messages.trendIncreased, { percentage: absPercentage })
      : trendType === 'negative'
      ? formatMessage(messages.trendDecreased, { percentage: absPercentage })
      : formatMessage(messages.trendNoChange);
  const screenReaderLabel = showQuarterComparisonLabel
    ? `${trendMessage}${formatMessage(messages.comparedToLastQuarter)}`
    : trendMessage;

  return (
    <Box display="flex" gap="8px">
      <ScreenReaderOnly>{screenReaderLabel}</ScreenReaderOnly>
      <Text
        aria-hidden
        m="0px"
        color={trendConfiguration[trendType].colorName}
        fontSize="s"
      >
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
      <Text aria-hidden m="0px" color="textSecondary">
        {showQuarterComparisonLabel && formatMessage(messages.lastQuarter)}
      </Text>
    </Box>
  );
};

export default TrendIndicator;
