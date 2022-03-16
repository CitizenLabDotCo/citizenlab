import React from 'react';

import { useNode, UserComponent } from '@craftjs/core';
import { Box } from '@citizenlab/cl2-component-library';

const CraftContainer: UserComponent = ({ children }) => {
  const {
    connectors: { drag, connect },
  } = useNode();

  return <Box ref={(ref) => ref && connect(drag(ref))}>{children}</Box>;
};

CraftContainer.craft = {
  name: 'One column',
};

export default CraftContainer;
