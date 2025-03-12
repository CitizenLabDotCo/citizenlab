import React, { useMemo } from 'react';

import { Tooltip } from '@citizenlab/cl2-component-library';

import { ResultGrouped, ResultUngrouped } from 'api/survey_results/types';

import { parseResult, SentimentAnswers } from '../../utils';

import SentimentBar from './SentimentBar';
import SentimentTooltip from './SentimentTooltip';
import { getAnswerGroups } from './utils';

type Props = {
  result: ResultUngrouped | ResultGrouped;
};

const SentimentScore = ({ result }: Props) => {
  // Parse the result to get the sentiment answers
  const allAnswers: SentimentAnswers = useMemo(
    () => parseResult(result),
    [result]
  );

  // Filter out any null answers (i.e. users who didn't answer the question)
  const questionAnswers = allAnswers?.filter(
    (answer) => answer.answer !== null
  );

  // Group the answers into low, neutral, and high sentiment
  const answerGroups = questionAnswers && getAnswerGroups({ questionAnswers });

  if (!answerGroups) return null;

  return (
    <Tooltip
      theme="dark"
      content={<SentimentTooltip answers={questionAnswers} />}
    >
      <SentimentBar answerGroups={answerGroups} />
    </Tooltip>
  );
};

export default SentimentScore;
