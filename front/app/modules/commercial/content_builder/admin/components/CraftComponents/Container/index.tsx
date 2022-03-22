import React from 'react';

// components
import { Box } from '@citizenlab/cl2-component-library';

// craft
import { useNode, UserComponent } from '@craftjs/core';

const Container: UserComponent = ({ children }) => {
  const {
    connectors: { drag, connect },
  } = useNode();

  return (
    <Box ref={(ref) => ref && connect(drag(ref))} minHeight="100px">
      {children}
    </Box>
  );
};

Container.craft = {
  // Component options can be added here
};

export default Container;
