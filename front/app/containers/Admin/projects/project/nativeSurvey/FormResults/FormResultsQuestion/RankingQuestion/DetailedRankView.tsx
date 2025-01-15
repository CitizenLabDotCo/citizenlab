import React from 'react';

import { Box, colors, Text } from '@citizenlab/cl2-component-library';

import ProgressBar from 'components/UI/ProgressBar';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';
import { RankingsCount, returnPercentageString } from './utils';

type Props = {
  rankingCounts: RankingsCount[];
  questionResponseCount: number;
  index: number;
};

const DetailedRankView = ({
  rankingCounts,
  questionResponseCount,
  index,
}: Props) => {
  const { formatMessage } = useIntl();

  return (
    <Box>
      {rankingCounts[index].rankCounts.map((rankCount, index) => {
        return (
          <Box ml="60px" display="flex" key={index} alignContent="center">
            <Text>
              {formatMessage(messages.resultRank, {
                resultRank: index + 1,
              })}
            </Text>

            <Box mx="12px" width="100%" my="auto">
              <ProgressBar
                progress={(rankCount[index] as number) / questionResponseCount}
                color={colors.primary}
                bgColor={colors.grey300}
              />
            </Box>

            <Text style={{ flexShrink: 0 }} color="coolGrey600" ml="auto">
              {formatMessage(messages.xChoices, {
                numberChoices: rankCount[index] || 0,
              })}
            </Text>

            <Text ml="12px">
              {returnPercentageString(
                rankCount[index] as number,
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
