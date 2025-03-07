import React, { useState } from 'react';

import { Box, colors, Text } from '@citizenlab/cl2-component-library';
import { useTheme } from 'styled-components';

import { ResultUngrouped } from 'api/survey_results/types';

import useLocale from 'hooks/useLocale';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import DetailedRankView from './DetailedRankView';
import DetailedViewButton from './DetailedViewButton';
import messages from './messages';
import {
  createOptionsWithAverageRanks,
  createOptionsWithDetailedRanks,
} from './utils';

type Props = {
  result: ResultUngrouped;
  hideDetailsButton?: boolean;
};

const RankingQuestion = ({ result, hideDetailsButton = false }: Props) => {
  const theme = useTheme();
  const locale = useLocale();
  const { formatMessage } = useIntl();

  const [showDetails, setShowDetails] = useState(false);

  const {
    // average_rankings: Average rank value for each option.
    average_rankings,
    // rankings_counts: Detailed ranking counts = the number of times an option was chosen for each rank level.
    rankings_counts,
    multilocs,
    questionResponseCount,
  } = result;

  if (!average_rankings || !rankings_counts || !multilocs) {
    return null;
  }

  // Create arrays for the average ranks and detailed rank counts
  const optionsWithAverageRanks =
    createOptionsWithAverageRanks(average_rankings);
  const optionsWithDetailedRanks =
    createOptionsWithDetailedRanks(rankings_counts);

  optionsWithAverageRanks.map((option) => {
    try {
      return multilocs.answer[option.optionKey].title_multiloc[locale];
    } catch (e) {
      return 'undefined';
    }
  });

  return (
    <Box
      display="flex"
      flexDirection="column"
      pt="16px"
      w="100%"
      maxWidth="520px"
    >
      {optionsWithAverageRanks.map((option) => {
        const currentOptionWithDetailedRanks = optionsWithDetailedRanks.find(
          (optionWithRanks) => optionWithRanks.optionKey === option.optionKey
        );

        const optionTitle =
          multilocs.answer[option.optionKey].title_multiloc[locale];

        return (
          <Box key={option.optionKey}>
            <Box
              display="flex"
              justifyContent="space-between"
              borderTop={`1px solid ${colors.divider}`}
            >
              <Box display="flex">
                <Text mr="20px" my="auto">
                  {formatMessage(messages.rank, {
                    rank: option.resultRank,
                  })}
                </Text>

                <Text
                  py="4px"
                  px="8px"
                  maxWidth="380px"
                  style={{
                    border: `1px solid ${colors.divider}`,
                    borderRadius: theme.borderRadius,
                  }}
                >
                  {optionTitle}
                </Text>
              </Box>
              <Box my="auto">
                <Text>
                  <FormattedMessage
                    {...messages.averageRank}
                    values={{
                      averageRank: parseFloat(option.averageRank.toFixed(1)),
                      b: (chunks: React.ReactNode) => <b>{chunks}</b>,
                    }}
                  />
                </Text>
              </Box>
            </Box>
            {showDetails && currentOptionWithDetailedRanks && (
              <DetailedRankView
                optionWithDetailedRanks={currentOptionWithDetailedRanks}
                questionResponseCount={questionResponseCount}
              />
            )}
          </Box>
        );
      })}
      {!hideDetailsButton && (
        <DetailedViewButton
          showDetails={showDetails}
          setShowDetails={setShowDetails}
        />
      )}
    </Box>
  );
};

export default RankingQuestion;
