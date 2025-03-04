import React from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';

import { SentimentAnswers } from '../utils';

type Props = {
  answers: SentimentAnswers;
};

const SentimentScore = ({ answers }: Props) => {
  const getBackgroundColour = (answer: string) => {
    if (answer === 'low') {
      return colors.red400;
    } else if (answer === 'neutral') {
      return colors.grey400;
    } else if (answer === 'high') {
      return colors.green300;
    }

    return '';
  };

  if (!answers) {
    return null;
  }

  const lowSentimentPercent = answers[0].percentage + answers[1].percentage;
  const neutralSentimentPercent = answers[2].percentage;
  const highSentimentPercent = answers[3].percentage + answers[4].percentage;

  const answerGroups = [
    { answer: 'low', percentage: lowSentimentPercent },
    { answer: 'neutral', percentage: neutralSentimentPercent },
    { answer: 'high', percentage: highSentimentPercent },
  ];

  return (
    <Box
      display="flex"
      alignItems="center"
      width="160px"
      overflow="hidden"
      gap="2px"
      minWidth="150px"
    >
      {answerGroups.map((answer) => {
        if (Number.isNaN(answer.answer)) {
          return null;
        }

        return (
          <Box
            background={getBackgroundColour(answer.answer)}
            key={answer.answer}
            width={`${answer.percentage}%`}
            height="8px"
            borderRadius="2px"
          />
        );
      })}
    </Box>
  );
};

export default SentimentScore;
