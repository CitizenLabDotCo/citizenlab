import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import { getSentimentGroupColour } from '../../utils';

const SentimentBar = ({
  answerGroups,
}: {
  answerGroups: { answer: string; percentage: number }[];
}) => (
  <Box display="flex" alignItems="center" width="160px" gap="2px">
    {answerGroups.map(({ answer, percentage }) => (
      <Box
        key={answer}
        background={getSentimentGroupColour(answer)}
        width={`${percentage}%`}
        height="8px"
        borderRadius="2px"
      />
    ))}
  </Box>
);

export default SentimentBar;
