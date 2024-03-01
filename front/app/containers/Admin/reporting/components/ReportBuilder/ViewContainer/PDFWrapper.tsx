import React from 'react';

// components
import { Box } from '@citizenlab/cl2-component-library';

// constants
import { A4_WIDTH, A4_HEIGHT } from 'containers/Admin/reporting/constants';

const PDFWrapper = ({ children }) => {
  return (
    <Box width={A4_WIDTH}>
      <Box
        background="white"
        px="30px"
        py="30px"
        width="100%"
        minHeight={A4_HEIGHT}
      >
        {children}
      </Box>
    </Box>
  );
};

export default PDFWrapper;
