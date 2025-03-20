import React from 'react';

import {
  Text,
  Icon,
  colors,
  IconNames,
} from '@citizenlab/cl2-component-library';

import { getTrendColorName } from 'components/admin/FormResults/FormResultsQuestion/SentimentQuestion/utils';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

type Props = {
  percentageDifference: number | null;
  showQuarterLabel?: boolean;
};
const TrendIndicator = ({ percentageDifference, showQuarterLabel }: Props) => {
  const { formatMessage } = useIntl();

  // Set the trend icon, color and percentage to use, depending on the trend direction
  // By default, the trend is neutral (0%)
  let trendIcon: IconNames | undefined = undefined;
  let trendColor = colors.grey700;
  let trendPercentage = '+0%';

  if (percentageDifference) {
    if (percentageDifference > 0) {
      // Trend direction: up
      trendIcon = 'trend-up';
      trendColor = colors.green500;
      trendPercentage = `+${Math.round(percentageDifference)}%`;
    } else if (percentageDifference < 0) {
      // Trend direction: down
      trendIcon = 'trend-down';
      trendColor = colors.red400;
      trendPercentage = `${Math.round(percentageDifference)}%`;
    }
  }

  return (
    <>
      {typeof percentageDifference === 'number' && (
        <Text
          m="0px"
          color={getTrendColorName(percentageDifference)}
          fontSize="s"
        >
          {trendIcon && (
            <Icon mr="4px" width="13px" name={trendIcon} fill={trendColor} />
          )}
          {trendPercentage}
          {showQuarterLabel && (
            <span style={{ color: colors.textSecondary }}>
              {formatMessage(messages.lastQuarter)}
            </span>
          )}
        </Text>
      )}
    </>
  );
};

export default TrendIndicator;
