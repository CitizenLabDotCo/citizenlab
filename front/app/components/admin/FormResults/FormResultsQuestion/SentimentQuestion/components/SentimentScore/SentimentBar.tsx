import React from 'react';

import { Box, colors, stylingConsts } from '@citizenlab/cl2-component-library';

import { getSentimentGroupColour } from '../../utils';

const SentimentBar = ({
  answerGroups,
}: {
  answerGroups?: { answer: string; percentage: number }[] | null;
}) => {
  return (
    <Box display="flex" alignItems="center" width="160px" gap="2px">
      {answerGroups ? (
        answerGroups.map(({ answer, percentage }) => (
          <Box
            key={answer}
            background={getSentimentGroupColour(answer)}
            width={`${percentage}%`}
            height="8px"
            borderRadius={stylingConsts.borderRadius}
          />
        ))
      ) : (
        // If no answers, show a solid grey bar.
        <Box
          key={undefined}
          background={colors.grey300}
          width={`100%`}
          height="8px"
          borderRadius={stylingConsts.borderRadius}
        />
      )}
    </Box>
  );
};

export default SentimentBar;
