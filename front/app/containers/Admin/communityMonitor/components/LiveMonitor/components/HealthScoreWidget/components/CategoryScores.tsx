import React from 'react';

import { Box, colors, Icon, Text } from '@citizenlab/cl2-component-library';
import { useSearchParams } from 'react-router-dom';

import { QuarterlyScores } from '../types';

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
    <Box display="flex">
      {sentimentScores?.categoryHealthScores.map((categoryScore) => (
        <>
          <Box mr="32px">
            <Box display="flex">
              <Icon my="auto" height="18px" name="dot" fill={colors.green400} />
              <Text m="0px" fontWeight="bold" fontSize="s">
                {categoryScore.localizedLabel}
              </Text>
            </Box>

            <Box display="flex" mt="8px">
              <Text
                m="0px"
                fontSize="xl"
                mt="auto"
                mr="4px"
                fontWeight="bold"
                lineHeight="1"
              >
                {
                  categoryScore.scores.find(
                    (score) => score.period === periodKey
                  )?.score
                }
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
        </>
      ))}
    </Box>
  );
};

export default CategoryScores;
