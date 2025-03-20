import React from 'react';

import { Box, Icon, Text } from '@citizenlab/cl2-component-library';
import { useSearchParams } from 'react-router-dom';

import { getPercentageDifference } from 'components/admin/FormResults/FormResultsQuestion/SentimentQuestion/utils';

import { QuarterlyScores } from '../types';
import { categoryColors } from '../utils';

import TrendIndicator from './TrendIndicator';

type Props = {
  sentimentScores: QuarterlyScores | null;
};

const CategoryScores = ({ sentimentScores }: Props) => {
  const [search] = useSearchParams();

  // Get the year and quarter
  const year = search.get('year') || new Date().getFullYear().toString();
  const quarter =
    search.get('quarter') ||
    (Math.floor(new Date().getMonth() / 3) + 1).toString();

  const periodKey = `${year}-${quarter}`;

  return (
    <Box display="flex" mt="12px">
      {sentimentScores?.categoryHealthScores.map((categoryScore) => {
        const categoryScoreValue = categoryScore.scores.find(
          (score) => score.period === periodKey
        )?.score;

        const currentCategoryScoreIndex = categoryScore.scores.findIndex(
          (score) => score.period === periodKey
        );

        const previousCategoryScoreValue =
          categoryScore.scores[currentCategoryScoreIndex - 1]?.score;
        const currentCategoryScoreValue =
          categoryScore.scores[currentCategoryScoreIndex]?.score;

        const percentageDifferenceValue = getPercentageDifference(
          currentCategoryScoreValue,
          previousCategoryScoreValue
        );

        return (
          <Box key={categoryScore.category} mr="30px">
            <Box>
              <Box display="flex">
                <Icon
                  my="auto"
                  height="18px"
                  name="dot"
                  fill={categoryColors[categoryScore.category]}
                />
                <Text m="0px" fontWeight="bold" fontSize="s">
                  {categoryScore.localizedLabel}
                </Text>
              </Box>

              <Box display="flex" justifyContent="flex-start" mt="8px" ml="8px">
                <Text
                  m="0px"
                  fontSize="xl"
                  mt="auto"
                  mr="4px"
                  fontWeight="bold"
                  lineHeight="1"
                  color={categoryScoreValue ? 'textPrimary' : 'coolGrey300'}
                >
                  {categoryScoreValue || '?'}
                </Text>
                <Text
                  fontWeight="semi-bold"
                  m="0px"
                  mt="auto"
                  fontSize="m"
                  lineHeight="1"
                >
                  /5
                </Text>
              </Box>
            </Box>
            <Box mt="4px" ml="12px" display="flex" justifyContent="flex-start">
              <TrendIndicator
                percentageDifference={percentageDifferenceValue}
              />
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};

export default CategoryScores;
