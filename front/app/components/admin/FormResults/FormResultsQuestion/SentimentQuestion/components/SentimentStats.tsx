import React from 'react';

import { Box, Title, Text } from '@citizenlab/cl2-component-library';

import { ResultGrouped, ResultUngrouped } from 'api/survey_results/types';

import TrendIndicator from 'components/TrendIndicator';

import { getPercentageDifference } from '../utils';

import SentimentScore from './SentimentScore';

type Props = {
  result: ResultUngrouped | ResultGrouped;
};

const SentimentStats = ({ result }: Props) => {
  // Calculate the percentage difference between the two periods
  const { averages } = result;
  const thisPeriodAvg = averages?.this_period;
  const lastPeriodAvg = averages?.last_period;

  const percentageDifference = getPercentageDifference(
    thisPeriodAvg,
    lastPeriodAvg
  );

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

        {typeof percentageDifference === 'number' && (
          <TrendIndicator percentageDifference={percentageDifference} />
        )}
      </Box>
      <SentimentScore result={result} />
    </Box>
  );
};

export default SentimentStats;
