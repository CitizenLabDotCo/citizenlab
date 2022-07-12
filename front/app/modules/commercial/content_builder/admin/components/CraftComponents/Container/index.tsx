import React from 'react';

// components
import { Box } from '@citizenlab/cl2-component-library';

// craft
import { UserComponent } from '@craftjs/core';

const Container: UserComponent = ({ children }) => {
  return (
    <Box id="e2e-single-column" minHeight="40px" w="100%">
      {children}
    </Box>
  );
};

export default Container;
