import React from 'react';

import { Text, Icon, Box } from '@citizenlab/cl2-component-library';

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

  return (
    <Box display="flex" gap="8px">
      <Text
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
      <Text m="0px" color="textSecondary">
        {showQuarterComparisonLabel && formatMessage(messages.lastQuarter)}
      </Text>
    </Box>
  );
};

export default TrendIndicator;
