import React from 'react';

// components
import { Box, useBreakpoint } from '@citizenlab/cl2-component-library';

// craft
import { UserComponent, Element } from '@craftjs/core';
import Container from '../Container';

const ThreeColumn: UserComponent = () => {
  const isLargeTablet = useBreakpoint('largeTablet');

  return (
    <Box
      id="e2e-three-column"
      flexDirection={isLargeTablet ? 'column' : 'row'}
      minHeight="40px"
      display="flex"
      w="100%"
      gap="4px"
    >
      <Box flex="1">
        <Element id="column1" is={Container} canvas />
      </Box>
      <Box flex="1">
        <Element id="column2" is={Container} canvas />
      </Box>
      <Box flex="1">
        <Element id="column3" is={Container} canvas />
      </Box>
    </Box>
  );
};

ThreeColumn.craft = {
  // Component options can be added here
};

export default ThreeColumn;
