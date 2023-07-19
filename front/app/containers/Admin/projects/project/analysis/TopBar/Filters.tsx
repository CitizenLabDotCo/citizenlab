import React from 'react';
import { Box, colors } from '@citizenlab/cl2-component-library';

const Filters = () => {
  return (
    <Box
      position="absolute"
      bottom="-200px"
      left="0"
      bg={colors.white}
      w="100%"
      h="200px"
    >
      Filters
      <Box>more</Box>
    </Box>
  );
};

export default Filters;
