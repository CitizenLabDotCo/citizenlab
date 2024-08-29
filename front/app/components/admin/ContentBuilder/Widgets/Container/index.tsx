import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { UserComponent } from '@craftjs/core';

import Events from 'containers/Admin/pagesAndMenu/containers/ContentBuilder/components/CraftComponents/Events';
import Projects from 'containers/Admin/pagesAndMenu/containers/ContentBuilder/components/CraftComponents/Projects';
import Proposals from 'containers/Admin/pagesAndMenu/containers/ContentBuilder/components/CraftComponents/Proposals';

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
