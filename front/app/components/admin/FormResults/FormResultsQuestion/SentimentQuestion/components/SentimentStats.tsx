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
        <Box display="flex" alignItems="baseline">
          <Title color="grey800" m="0" variant="h4">
            {thisPeriodAvg ?? '-'}
          </Title>
          <Text
            color="grey700"
            fontSize="s"
            fontWeight="semi-bold"
            m="0"
            ml="4px"
          >
            /5
          </Text>
        </Box>
        {percentageDifference !== null && (
          <TrendIndicator percentageDifference={percentageDifference} />
        )}
      </Box>
      <SentimentScore result={result} />
    </Box>
  );
};

export default SentimentStats;
