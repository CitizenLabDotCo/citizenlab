import React from 'react';

import {
  Box,
  Title,
  Text,
  Icon,
  colors,
  IconNames,
} from '@citizenlab/cl2-component-library';

import { ResultGrouped, ResultUngrouped } from 'api/survey_results/types';

import { getPercentageDifference, getTrendColorName } from '../utils';

import SentimentScore from './SentimentScore';

type Props = {
  result: ResultUngrouped | ResultGrouped;
};

const SentimentStats = ({ result }: Props) => {
  // Calculate the percentage difference between the two periods
  const { averages } = result;
  const thisPeriodAvg = averages?.this_period;
  const lastPeriodAvg = averages?.last_period;

  const percentageDifference =
    !!lastPeriodAvg &&
    !!thisPeriodAvg &&
    getPercentageDifference(thisPeriodAvg, lastPeriodAvg);

  // Set the trend icon, color and percentage to use, depending on the trend direction
  // By default, the trend is neutral (0%)
  let trendIcon: IconNames | undefined = undefined;
  let trendColor = colors.grey700;
  let trendPercentage = '0%';

  if (percentageDifference) {
    if (percentageDifference > 0) {
      // Trend direction: up
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
    <Box my="auto">
      <Box display="flex" justifyContent="space-between" mb="4px">
        <Box display="flex">
          <Title color="grey800" m="0px" variant="h4">
            {thisPeriodAvg}
          </Title>
          <Text
            color="grey700"
            fontSize="s"
            fontWeight="semi-bold"
            m="0px"
            mt="auto"
          >
            /5
          </Text>
        </Box>

        {percentageDifference && (
          <Text
            m="0px"
            color={getTrendColorName(percentageDifference)}
            fontSize="s"
          >
            {trendIcon && (
              <Icon mr="4px" width="13px" name={trendIcon} fill={trendColor} />
            )}
            {trendPercentage}
          </Text>
        )}
      </Box>
      <SentimentScore result={result} />
    </Box>
  );
};

export default SentimentStats;
