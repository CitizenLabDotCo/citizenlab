import React from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';

interface Props {
  children: React.ReactNode;
}

const Row = ({ children }: Props) => {
  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      h="60px"
      borderBottom={`1px solid ${colors.divider}`}
    >
      {children}
    </Box>
  );
};

export default Row;
