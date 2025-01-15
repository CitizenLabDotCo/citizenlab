import React from 'react';

import { Box, colors, Text } from '@citizenlab/cl2-component-library';

import ProgressBar from 'components/UI/ProgressBar';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';
import { OptionWithRanks, returnPercentageString } from './utils';

type Props = {
  optionsWithRanks: OptionWithRanks[];
  questionResponseCount: number;
  rank: number;
};

const DetailedRankView = ({
  optionsWithRanks,
  questionResponseCount,
  rank,
}: Props) => {
  const { formatMessage } = useIntl();

  return (
    <Box>
      {optionsWithRanks[rank].rankCounts.map((rankCount, index) => {
        const choseRankForOptionCount = rankCount[1]; // Number of people who chose this rank for this option

        return (
          <Box ml="60px" display="flex" key={index} alignContent="center">
            <Text my="8px">
              {formatMessage(messages.resultRank, {
                resultRank: index + 1,
              })}
            </Text>

            <Box mx="12px" maxWidth="280px" width="100%" my="auto">
              <ProgressBar
                progress={choseRankForOptionCount / questionResponseCount}
                color={colors.primary}
                bgColor={colors.grey300}
              />
            </Box>

            <Text
              my="8px"
              style={{ flexShrink: 0 }}
              color="coolGrey600"
              ml="auto"
            >
              {formatMessage(messages.xChoices, {
                numberChoices: choseRankForOptionCount || 0,
              })}
            </Text>

            <Text my="8px" ml="12px">
              {returnPercentageString(
                choseRankForOptionCount,
                questionResponseCount
              )}
            </Text>
          </Box>
        );
      })}
    </Box>
  );
};

export default DetailedRankView;
