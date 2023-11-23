import React from 'react';

// components
import { Box } from '@citizenlab/cl2-component-library';

// craft
import { UserComponent } from '@craftjs/core';
import Events from '../Events';
import Proposals from '../Proposals';
import Projects from '../Projects';

const Container: UserComponent = ({ children }) => {
  return (
    <Box className="e2e-single-column" minHeight="40px" w="100%">
      {children}
    </Box>
  );
};

Container.craft = {
  rules: {
    canMoveIn: (incomingNodes) => {
      return !incomingNodes.some(
        (node) =>
          node.data.type === Events ||
          node.data.type === Proposals ||
          node.data.type === Projects
      );
    },
  },
};

export default Container;
