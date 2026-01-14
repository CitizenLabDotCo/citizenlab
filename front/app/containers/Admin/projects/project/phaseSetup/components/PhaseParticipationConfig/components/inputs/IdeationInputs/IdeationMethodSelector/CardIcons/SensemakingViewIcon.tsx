import React from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';

const SensemakingViewIcon = ({ selected }: { selected: boolean }) => {
  const bgColor = selected ? colors.teal200 : colors.grey500;

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      w="104px"
      h="28px"
    >
      <Box position="relative" w="80px" h="28px">
        {/* Central circle */}
        <Box
          position="absolute"
          left="50%"
          top="50%"
          style={{ transform: 'translate(-50%, -50%)' }}
          bgColor={bgColor}
          borderRadius="50%"
          w="16px"
          h="16px"
        />
        {/* Surrounding circles */}
        <Box
          position="absolute"
          left="8px"
          top="2px"
          bgColor={bgColor}
          opacity={0.5}
          borderRadius="50%"
          w="10px"
          h="10px"
        />
        <Box
          position="absolute"
          right="8px"
          top="2px"
          bgColor={bgColor}
          opacity={0.5}
          borderRadius="50%"
          w="10px"
          h="10px"
        />
        <Box
          position="absolute"
          left="8px"
          bottom="2px"
          bgColor={bgColor}
          opacity={0.5}
          borderRadius="50%"
          w="10px"
          h="10px"
        />
        <Box
          position="absolute"
          right="8px"
          bottom="2px"
          bgColor={bgColor}
          opacity={0.5}
          borderRadius="50%"
          w="10px"
          h="10px"
        />
      </Box>
    </Box>
  );
};

export default SensemakingViewIcon;
