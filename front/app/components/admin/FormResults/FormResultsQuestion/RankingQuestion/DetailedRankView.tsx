import React from 'react';

import { Box, colors, Text } from '@citizenlab/cl2-component-library';

import ProgressBar from 'components/UI/ProgressBar';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';
import { OptionDetailedRanks, returnRankPercentageString } from './utils';

type Props = {
  optionWithDetailedRanks: OptionDetailedRanks;
  questionResponseCount: number;
};

const DetailedRankView = ({
  optionWithDetailedRanks,
  questionResponseCount,
}: Props) => {
  const { formatMessage } = useIntl();

  return (
    <Box mb="8px">
      {optionWithDetailedRanks.rankCounts.map((rankCount, index) => {
        // Note:
        // rankCount[0] = The rank value (E.g. #1, #2, etc.)
        // rankCount[1] = Number of people who chose this rank value for the option.

        const choseRankForOptionCount = rankCount[1];

        return (
          <Box ml="54px" display="flex" key={index}>
            <Text my="8px">
              {formatMessage(messages.rank, {
                rank: rankCount[0],
              })}
            </Text>

            <Box mx="12px" maxWidth="280px" width="100%" my="auto">
              <ProgressBar
                progress={choseRankForOptionCount / questionResponseCount}
                color={colors.primary}
                bgColor={colors.grey300}
              />
            </Box>

            <Text my="8px" color="coolGrey600" ml="auto">
              {formatMessage(messages.xChoices, {
                numberChoices: choseRankForOptionCount,
              })}
            </Text>

            <Text my="8px" ml="12px">
              {returnRankPercentageString(
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
