import React, { useMemo } from 'react';

import { Tooltip } from '@citizenlab/cl2-component-library';

import { ResultGrouped, ResultUngrouped } from 'api/survey_results/types';

import { parseResult, SentimentAnswers } from '../../utils';

import SentimentBar from './SentimentBar';
import SentimentTooltip from './SentimentTooltip';

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

  // Group the answers (values of 1 - 5) into low, neutral, and high sentiment
  const answerGroups = useMemo(() => {
    if (!questionAnswers) return null;

    const lowSentiment =
      questionAnswers[0].percentage + questionAnswers[1].percentage; // Values 1 and 2
    const neutralSentiment = questionAnswers[2].percentage; // Value 3
    const highSentiment =
      questionAnswers[3].percentage + questionAnswers[4].percentage; // Values 4 and 5

    return [
      { answer: 'high', percentage: highSentiment },
      { answer: 'neutral', percentage: neutralSentiment },
      { answer: 'low', percentage: lowSentiment },
    ];
  }, [questionAnswers]);

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
