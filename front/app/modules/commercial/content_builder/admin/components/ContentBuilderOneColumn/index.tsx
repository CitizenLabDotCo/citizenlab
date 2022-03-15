import React from 'react';

import { useNode, UserComponent } from '@craftjs/core';
import { Box } from '@citizenlab/cl2-component-library';

const ContentBuilderOneColumn: UserComponent = ({ children }) => {
  const {
    connectors: { drag, connect },
  } = useNode();

  return (
    <Box
      border="1px solid red"
      height="200px"
      ref={(ref) => ref && connect(drag(ref))}
    >
      {children}
    </Box>
  );
};

ContentBuilderOneColumn.craft = {
  name: 'One column',
};

export default ContentBuilderOneColumn;
