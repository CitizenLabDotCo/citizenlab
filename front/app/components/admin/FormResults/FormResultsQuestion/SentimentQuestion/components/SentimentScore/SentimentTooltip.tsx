import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';

import useLocalize from 'hooks/useLocalize';

import { getSentimentValueColour, SentimentAnswers } from '../../utils';

const SentimentTooltip = ({ answers }: { answers: SentimentAnswers }) => {
  const localize = useLocalize();

  return (
    <Box
      p="12px"
      display="flex"
      flexDirection="column"
      gap="8px"
      minWidth="200px"
    >
      {answers?.map(({ answer, label, percentage }, index) => (
        <Box key={`${answer}-${index}`}>
          {answer && (
            <Box
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
                  {localize(label)}
                </Text>
              </Box>
              <Text m="0px" fontWeight="bold" color="white">
                {percentage}%
              </Text>
            </Box>
          )}
        </Box>
      ))}
    </Box>
  );
};

export default SentimentTooltip;
