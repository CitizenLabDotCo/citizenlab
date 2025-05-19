import React from 'react';

import { Tooltip, Box, Text, Icon } from '@citizenlab/cl2-component-library';

import { ResultGrouped, ResultUngrouped } from 'api/survey_results/types';

import { SentimentAnswers, parseGroupedResult } from '../../utils';
import SentimentBar from '../SentimentScore/SentimentBar';
import SentimentTooltip from '../SentimentScore/SentimentTooltip';
import { getAnswerGroups } from '../SentimentScore/utils';

import { getAverageValue, transformGroupedAnswerUsableArray } from './utils';

type Props = {
  result: ResultUngrouped | ResultGrouped;
  groupKey: string | null;
  label?: string | null;
  color?: string;
};

const GroupedSentimentScore = ({ result, groupKey, label, color }: Props) => {
  if (!result.grouped || !groupKey) return null;

  const groupAnswersArray = transformGroupedAnswerUsableArray(
    result.answers,
    groupKey
  );
  const groupAnswers: SentimentAnswers =
    parseGroupedResult(result, groupAnswersArray) || [];

  if (groupAnswers.length === 0) return null;

  const groupAnswerGroups = getAnswerGroups({ questionAnswers: groupAnswers });
  const averageValue = getAverageValue(groupAnswers, groupAnswersArray);

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
