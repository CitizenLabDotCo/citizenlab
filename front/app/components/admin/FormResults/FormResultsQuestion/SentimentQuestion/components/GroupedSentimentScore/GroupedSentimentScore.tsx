import React from 'react';

import { Tooltip, Box, Text, Icon } from '@citizenlab/cl2-component-library';

import { ResultGrouped, ResultUngrouped } from 'api/survey_results/types';

import {
  SentimentAnswers,
  calculateResponseCountForGroup,
  parseGroupedResult,
} from '../../utils';
import SentimentBar from '../SentimentScore/SentimentBar';
import SentimentTooltip from '../SentimentScore/SentimentTooltip';
import { getAnswerGroups } from '../SentimentScore/utils';

import { transformGroupedAnswerUsableArray } from './utils';

type Props = {
  result: ResultUngrouped | ResultGrouped;
  groupKey: string | null;
  label?: string | null;
  color?: string;
};

const GroupedSentimentScore = ({ result, groupKey, label, color }: Props) => {
  // Extract sentiment answers for the specified group using helper functions
  // Falls back to an empty array if result.grouped or groupKey is missing
  const groupAnswersArray =
    result.grouped &&
    groupKey &&
    transformGroupedAnswerUsableArray(result.answers, groupKey);

  const groupAnswers: SentimentAnswers =
    (groupAnswersArray && parseGroupedResult(result, groupAnswersArray)) || [];

  // Categorize the group answers into sentiment buckets (e.g. low, neutral, high)
  const groupAnswerGroups = getAnswerGroups({
    questionAnswers: groupAnswers,
  });

  // If there are no answers for this group, render nothing
  if (groupAnswers.length === 0) {
    return null;
  }

  const getAverageValue = (
    groupAnswers: SentimentAnswers
  ): number | undefined => {
    const totalResponseCountForGroup =
      groupAnswersArray && calculateResponseCountForGroup(groupAnswersArray);

    const totalSentimentValue = groupAnswers?.reduce(
      (acc, { answer, count }) => {
        if (answer && count) {
          return acc + answer * count;
        }
        return acc;
      },
      0
    );

    return totalSentimentValue &&
      totalResponseCountForGroup &&
      totalResponseCountForGroup > 0
      ? Math.round(totalSentimentValue / totalResponseCountForGroup)
      : undefined;
  };
  const averageValue = getAverageValue(groupAnswers);

  // Render a horizontal sentiment bar wrapped in a tooltip
  // The tooltip displays the raw answers when hovered
  return (
    <Box
      mt="20px"
      display="flex"
      alignItems="center"
      justifyContent="space-between"
    >
      <Box display="flex" alignItems="center">
        <Icon name="dot" fill={color} width="16px" />
        <Text color="textSecondary" m="0px" fontSize="s" mr="8px">
          {label}
        </Text>
      </Box>

      <Box display="flex" alignItems="center">
        <Tooltip
          theme="dark"
          content={<SentimentTooltip answers={groupAnswers} />}
        >
          <SentimentBar answerGroups={groupAnswerGroups || undefined} />
        </Tooltip>
        <Box w="38px" display="flex" gap="2px">
          <Text m="0px" ml="4px" fontSize="s" color="textSecondary">
            {averageValue}
          </Text>
          <Text mt="auto" m="0px" fontSize="xs" color="textSecondary">
            /5
          </Text>
        </Box>
      </Box>
    </Box>
  );
};

export default GroupedSentimentScore;
