import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import NumberResponses from './NumberResponses';

interface Props {
  numberResponses: { answer: number }[];
}

const NumberQuestion = ({ numberResponses }: Props) => {
  return (
    <Box display="flex" gap="24px" mt="20px">
      <Box flex="1">
        <NumberResponses numberResponses={numberResponses} />
      </Box>
    </Box>
  );
};

export default NumberQuestion;
