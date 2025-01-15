import React, { useState } from 'react';

import { Box, colors, Text } from '@citizenlab/cl2-component-library';
import { useTheme } from 'styled-components';

import { ResultUngrouped } from 'api/survey_results/types';

import useLocale from 'hooks/useLocale';

import { useIntl } from 'utils/cl-intl';

import DetailedRankView from './DetailedRankView';
import DetailedViewButton from './DetailedViewButton';
import messages from './messages';
import {
  createAverageRankingsArray,
  createOptionsWithRanksArray,
} from './utils';

const RankingQuestion = (result: { result: ResultUngrouped }) => {
  const theme = useTheme();
  const locale = useLocale();
  const { formatMessage } = useIntl();

  const [showDetails, setShowDetails] = useState(false);

  const {
    average_rankings,
    rankings_counts,
    multilocs,
    questionResponseCount,
  } = result.result;

  if (!average_rankings || !rankings_counts || !multilocs) {
    return null;
  }

  // Create arrays for the average rankings and detailed ranking counts for options
  const averageRanks = createAverageRankingsArray(average_rankings);
  const optionsWithRanks = createOptionsWithRanksArray(rankings_counts);

  return (
    <Box pt="16px" width="520px">
      {averageRanks.map((avgRanking, index) => {
        return (
          <Box key={avgRanking.optionKey}>
            <Box
              display="flex"
              justifyContent="space-between"
              borderTop={`1px solid ${colors.divider}`}
            >
              <Box display="flex">
                <Text mr="20px" my="auto">
                  {formatMessage(messages.resultRank, {
                    resultRank: avgRanking.resultRank,
                  })}
                </Text>

                <Text
                  p="4px"
                  style={{
                    border: `1px solid ${colors.divider}`,
                    borderRadius: theme.borderRadius,
                  }}
                >
                  {
                    multilocs.answer[avgRanking.optionKey].title_multiloc[
                      locale
                    ]
                  }
                </Text>
              </Box>
              <Box my="auto">
                <Text>
                  {formatMessage(messages.averageRank, {
                    averageRank: avgRanking.averageRank
                      .toFixed(1)
                      .replace(/[.,]0$/, ''), // Remove any trailing zeros
                    b: (chunks) => <b>{chunks}</b>,
                  })}
                </Text>
              </Box>
            </Box>
            {showDetails && (
              <DetailedRankView
                optionsWithRanks={optionsWithRanks}
                questionResponseCount={questionResponseCount}
                rank={index}
              />
            )}
          </Box>
        );
      })}
      <DetailedViewButton
        showDetails={showDetails}
        setShowDetails={setShowDetails}
      />
    </Box>
  );
};

export default RankingQuestion;
