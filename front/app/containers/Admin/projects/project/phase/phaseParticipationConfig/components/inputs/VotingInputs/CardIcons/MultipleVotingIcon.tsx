import React from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';

const MultipleVotingIcon = ({ selected }: { selected: boolean }) => {
  const bgColor = selected ? colors.teal200 : colors.grey500;

  return (
    <Box display="flex">
      <Box bgColor={bgColor} borderRadius="4px" height="100%" px="5px">
        <Box my="auto" height="100%">
          <svg
            width="10"
            height="100%"
            viewBox="0 0 10 10"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="5" cy="5" r="5" fill="white" />
          </svg>
          <svg
            style={{ marginLeft: '2px' }}
            width="10"
            viewBox="0 0 10 10"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="5" cy="5" r="5" fill="white" />
          </svg>
        </Box>
      </Box>
      <Box
        bgColor={bgColor}
        opacity={0.5}
        borderRadius="4px"
        w="32px"
        h="26px"
        ml="4px"
      >
        <svg
          width="10"
          height="100%"
          viewBox="0 0 10 10"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="5" cy="5" r="5" fill="white" />
        </svg>
      </Box>
      <Box
        bgColor={bgColor}
        opacity={0.5}
        borderRadius="4px"
        w="32px"
        h="26px"
        ml="4px"
      />
    </Box>
  );
};

export default MultipleVotingIcon;
