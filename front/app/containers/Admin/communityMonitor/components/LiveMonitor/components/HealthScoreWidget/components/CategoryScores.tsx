import React from 'react';

import { Box, Icon, Text } from '@citizenlab/cl2-component-library';
import { useSearchParams } from 'react-router-dom';

import { getPercentageDifference } from 'components/admin/FormResults/FormResultsQuestion/SentimentQuestion/utils';
import TrendIndicator from 'components/TrendIndicator';

import { QuarterlyScores } from '../types';
import { categoryColors, getYearFilter, getQuarterFilter } from '../utils';

type Props = {
  sentimentScores: QuarterlyScores | null;
};

const CategoryScores = ({ sentimentScores }: Props) => {
  const [search] = useSearchParams();

  // Extract year and quarter from search params or defaults
  const year = getYearFilter(search);
  const quarter = getQuarterFilter(search);
  const periodKey = `${year}-${quarter}`;

  // Helper function to get score data for a category
  const getCategoryScoreData = (
    scores: { period: string; score: number }[]
  ) => {
    const currentIndex = scores.findIndex(({ period }) => period === periodKey);
    const currentScore = scores[currentIndex]?.score ?? null;
    const previousScore = scores[currentIndex - 1]?.score ?? null;
    return {
      currentScore,
      percentageDifference: getPercentageDifference(
        currentScore,
        previousScore
      ),
    };
  };

  return (
    <Box display="flex" mt="12px">
      {sentimentScores?.categoryHealthScores.map(
        ({ category, localizedLabel, scores }) => {
          const { currentScore, percentageDifference } =
            getCategoryScoreData(scores);

          return (
            <Box key={category} mr="28px">
              {/* Category Label */}
              <Box display="flex" alignItems="center">
                <Icon
                  height="18px"
                  name="dot"
                  fill={categoryColors[category]}
                />
                <Text m="0px" fontWeight="bold" fontSize="s">
                  {localizedLabel}
                </Text>
              </Box>

              {/* Score Display */}
              <Box display="flex" alignItems="center" ml="8px">
                <Text
                  m="0px"
                  fontSize="xl"
                  fontWeight="bold"
                  lineHeight="1"
                  mr="4px"
                  color={currentScore ? 'textPrimary' : 'coolGrey300'}
                >
                  {currentScore || '?'}
                </Text>
                <Text fontWeight="semi-bold" fontSize="m" lineHeight="1">
                  /5
                </Text>
              </Box>

              {/* Trend Indicator */}
              <Box mt="4px" ml="12px">
                <TrendIndicator percentageDifference={percentageDifference} />
              </Box>
            </Box>
          );
        }
      )}
    </Box>
  );
};

export default CategoryScores;
