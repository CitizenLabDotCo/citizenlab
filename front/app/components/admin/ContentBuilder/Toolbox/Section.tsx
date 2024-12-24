import React from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';

const Section = ({ children }) => (
  <Box borderTop={`1px solid ${colors.divider}`} pt="12px" mb="12px">
    {children}
  </Box>
);

export default Section;
