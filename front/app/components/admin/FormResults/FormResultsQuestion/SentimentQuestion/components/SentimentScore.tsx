import React from 'react';

import { Box, Text, Tooltip } from '@citizenlab/cl2-component-library';

import useLocalize from 'hooks/useLocalize';

import {
  getSentimentGroupColour,
  getSentimentValueColour,
  SentimentAnswers,
} from '../utils';

type Props = {
  answers: SentimentAnswers;
};

const SentimentScore = ({ answers }: Props) => {
  const localize = useLocalize();

  if (!answers) {
    return null;
  }

  // Group the 5 sentiment results into low, medium, and high groups
  const lowSentimentPercent = answers[0].percentage + answers[1].percentage;
  const neutralSentimentPercent = answers[2].percentage;
  const highSentimentPercent = answers[3].percentage + answers[4].percentage;

  const answerGroups = [
    { answer: 'high', percentage: highSentimentPercent },
    { answer: 'neutral', percentage: neutralSentimentPercent },
    { answer: 'low', percentage: lowSentimentPercent },
  ];

  return (
    <Tooltip
      theme="dark"
      content={
        <Box
          p="12px"
          display="flex"
          flexDirection="column"
          gap="8px"
          minWidth="180px"
        >
          {answers.map(({ answer, label, percentage }) => (
            <>
              {answer && (
                <Box
                  key={answer}
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Box display="flex" alignItems="center" gap="8px">
                    <Box
                      width="8px"
                      height="8px"
                      borderRadius="50%"
                      background={getSentimentValueColour(answer)}
                    />
                    <Text maxWidth="140px" m="0px" color="white" pr="8px">
                      {typeof label !== 'string' && localize(label)}
                    </Text>
                  </Box>
                  <Text m="0px" fontWeight="bold" color="white">
                    {percentage}%
                  </Text>
                </Box>
              )}
            </>
          ))}
        </Box>
      }
    >
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
              background={getSentimentGroupColour(answer.answer)}
              key={answer.answer}
              width={`${answer.percentage}%`}
              height="8px"
              borderRadius="2px"
            />
          );
        })}
      </Box>
    </Tooltip>
  );
};

export default SentimentScore;
