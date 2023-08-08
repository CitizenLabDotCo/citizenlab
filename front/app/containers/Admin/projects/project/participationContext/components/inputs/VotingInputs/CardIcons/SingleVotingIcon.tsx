import React from 'react';

// components
import { Box } from '@citizenlab/cl2-component-library';

// styling
import { colors } from 'utils/styleUtils';

const SingleVotingIcon = ({ selected }: { selected: boolean }) => {
  const bgColor = selected ? colors.teal200 : colors.grey500;

  return (
    <Box display="flex">
      <Box bgColor={bgColor} borderRadius="4px" pt="2px" px="5px">
        <svg
          width="22"
          height="20"
          viewBox="0 0 20 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M15.75 5.25L6.75 14.25L2.625 10.125L3.6825 9.0675L6.75 12.1275L14.6925 4.1925L15.75 5.25Z"
              fill="white"
              stroke="white"
            />
          </svg>
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

export default SingleVotingIcon;
