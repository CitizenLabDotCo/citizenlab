import React from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';

const ForumViewIcon = ({ selected }: { selected: boolean }) => {
  const bgColor = selected ? colors.teal200 : colors.grey500;

  return (
    <Box display="flex" flexDirection="column" gap="4px">
      <Box display="flex" gap="4px">
        <Box bgColor={bgColor} borderRadius="4px" w="32px" h="12px" />
        <Box
          bgColor={bgColor}
          borderRadius="4px"
          w="32px"
          h="12px"
          opacity={0.5}
        />
        <Box
          bgColor={bgColor}
          borderRadius="4px"
          w="32px"
          h="12px"
          opacity={0.5}
        />
      </Box>
      <Box display="flex" gap="4px">
        <Box
          bgColor={bgColor}
          borderRadius="4px"
          w="32px"
          h="12px"
          opacity={0.5}
        />
        <Box
          bgColor={bgColor}
          borderRadius="4px"
          w="32px"
          h="12px"
          opacity={0.5}
        />
        <Box
          bgColor={bgColor}
          borderRadius="4px"
          w="32px"
          h="12px"
          opacity={0.5}
        />
      </Box>
    </Box>
  );
};

export default ForumViewIcon;
