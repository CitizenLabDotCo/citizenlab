import React from 'react';

import {
  Box,
  Icon,
  Text,
  useBreakpoint,
} from '@citizenlab/cl2-component-library';
import { useSearchParams } from 'react-router-dom';

import { getPercentageDifference } from 'components/admin/FormResults/FormResultsQuestion/SentimentQuestion/utils';
import TrendIndicator from 'components/TrendIndicator';

import { QuarterlyScores } from '../types';
import { categoryColors, getYearFilter, getQuarterFilter } from '../utils';

type Props = {
  sentimentScores: QuarterlyScores | null;
  year?: string;
  quarter?: string;
};

const CategoryScores = ({ sentimentScores, ...props }: Props) => {
  const [search] = useSearchParams();
  const isMobileOrSmaller = useBreakpoint('phone');

  // Extract year and quarter from search params or defaults
  const year = props.year || getYearFilter(search);
  const quarter = props.quarter || getQuarterFilter(search);
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
    <Box
      display="flex"
      mt="12px"
      flexDirection={isMobileOrSmaller ? 'column' : 'row'}
      gap={isMobileOrSmaller ? '16px' : undefined}
    >
      {sentimentScores?.categoryHealthScores.map(
        ({ category, localizedLabel, scores }) => {
          const { currentScore, percentageDifference } =
            getCategoryScoreData(scores);

          const isOtherCategoryAndHasScores =
            category === 'other' && scores.length > 0;

          // Even if they are empty, for the 3 main categories we always
          // want to show them anyways in the UI. "Other" we only show if relevant.
          const showCategory =
            category !== 'other' || isOtherCategoryAndHasScores;

          return (
            <Box key={category} mr="28px">
              {showCategory && (
                <>
                  <Box display="flex" alignItems="center">
                    {/* Category Label */}
                    <Icon
                      height="18px"
                      name="dot"
                      fill={categoryColors[category]}
                    />
                    <Text m="0px" fontWeight="bold" fontSize="s">
                      {localizedLabel}
                    </Text>
                  </Box>
                  <Box my="8px" display="flex" alignItems="center" ml="8px">
                    {/* Score */}
                    <Text
                      m="0px"
                      fontSize="xl"
                      fontWeight="bold"
                      lineHeight="1"
                      mr="4px"
                      color={'textPrimary'}
                    >
                      {currentScore || '-'}
                    </Text>
                    <Text
                      m="0px"
                      fontWeight="semi-bold"
                      fontSize="m"
                      lineHeight="1"
                    >
                      /5
                    </Text>
                  </Box>

                  {/* Trend Indicator */}
                  <Box ml="12px">
                    <TrendIndicator
                      percentageDifference={percentageDifference}
                    />
                  </Box>
                </>
              )}
            </Box>
          );
        }
      )}
    </Box>
  );
};

export default CategoryScores;
