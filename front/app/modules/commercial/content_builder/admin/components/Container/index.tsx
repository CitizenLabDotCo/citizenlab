import React from 'react';

import { useNode, UserComponent } from '@craftjs/core';
import { Box } from '@citizenlab/cl2-component-library';

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

// Container.craft = {
//   //
// };

export default Container;
