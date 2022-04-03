import React from 'react';
import Text from '../Text';

// components
import { Box } from '@citizenlab/cl2-component-library';

// craft
import { useNode, UserComponent } from '@craftjs/core';

const Container: UserComponent = ({ children }) => {
  const {
    connectors: { drag, connect },
  } = useNode();

  return (
    <Box ref={(ref) => ref && connect(drag(ref))} minHeight="100px" w="100%">
      {children}
    </Box>
  );
};

Container.craft = {
  rules: {
    canMoveIn: (nodes) => nodes.every((node) => node.data.type === Text),
  },
};

export default Container;
