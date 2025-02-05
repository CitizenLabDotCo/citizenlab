import React from 'react';

import { Box, Text, colors } from '@citizenlab/cl2-component-library';

const BORDER = `1px solid ${colors.divider}`;

const VerticalBar = ({ type, count, percentage, color, width }) => {
  const label = `${percentage}% (${count})`;

  return (
    <Box
      width={width}
      height="150px"
      borderRadius="4px"
      border={BORDER}
      overflow="hidden"
      display="flex"
      flexDirection="column-reverse"
      position="relative"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        height={`${percentage}%`}
        width="100%"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="e2e-progress-bar"
      >
        <rect width="100" height="100" fill={color} />
      </svg>
      {type !== 'single' && (
        <Text
          m="0"
          fontSize="xs"
          textAlign="center"
          color="white"
          position="absolute"
          bottom="0"
          width="100%"
        >
          {label}
        </Text>
      )}
    </Box>
  );
};

export default VerticalBar;
