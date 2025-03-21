import React from 'react';

import { Text, Icon, colors } from '@citizenlab/cl2-component-library';

import { getTrendColorName } from 'components/admin/FormResults/FormResultsQuestion/SentimentQuestion/utils';

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
    <Text m="0px" color={getTrendColorName(percentageDifference)} fontSize="s">
      {currentTrendConfig.icon && (
        <Icon
          mr="4px"
          width="13px"
          name={currentTrendConfig.icon}
          fill={currentTrendConfig.color}
        />
      )}
      {trendPercentageLabel}
      {showQuarterComparisonLabel && (
        <span style={{ color: colors.textSecondary }}>
          {formatMessage(messages.previous_quarter)}
        </span>
      )}
    </Text>
  );
};

export default TrendIndicator;
