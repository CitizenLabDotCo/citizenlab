import React from 'react';

// components
import { Box } from '@citizenlab/cl2-component-library';

// craft
import { UserComponent } from '@craftjs/core';
import Text from '../Text';
import Image from '../Image';
import AboutBox from '../AboutBox';

const Container: UserComponent = ({ children }) => {
  return (
    <Box minHeight="40px" w="100%">
      {children}
    </Box>
  );
};

Container.craft = {
  rules: {
    canMoveIn: (nodes) => {
      return nodes.every(
        (node) =>
          node.data.type === Text ||
          node.data.type === Image ||
          node.data.type === AboutBox
      );
    },
  },
};

export default Container;
