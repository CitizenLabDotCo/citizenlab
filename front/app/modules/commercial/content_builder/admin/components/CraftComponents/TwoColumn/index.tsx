import React from 'react';

// components
import { Box, useBreakpoint } from '@citizenlab/cl2-component-library';

// craft
import { useNode, UserComponent, Element } from '@craftjs/core';
import Container from '../Container';

const TwoColumn: UserComponent = () => {
  const isLargeTablet = useBreakpoint('largeTablet');
  const {
    connectors: { drag, connect },
  } = useNode();

  return (
    <Box
      ref={(ref) => ref && connect(drag(ref))}
      flexDirection={isLargeTablet ? 'column' : 'row'}
      minHeight="100px"
      display="flex"
      w="100%"
    >
      <Box
        m="-4px"
        mb={isLargeTablet ? '2px' : '0px'}
        mr={isLargeTablet ? '-4px' : '0px'}
        flex="1"
      >
        <Element id="column1" is={Container} canvas />
      </Box>
      <Box m="-4px" ml={isLargeTablet ? '-4px' : '0px'} flex="1">
        <Element id="column2" is={Container} canvas />
      </Box>
    </Box>
  );
};

TwoColumn.craft = {
  // Component options can be added here
};

export default TwoColumn;
