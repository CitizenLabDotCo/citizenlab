import React, { ReactNode } from 'react';

import { Box } from '@citizenlab/cl2-component-library';

interface Props {
  children: ReactNode;
}

const BaseFooter = ({ children }: Props) => {
  return (
    <Box
      width="100%"
      display="flex"
      alignItems="center"
      justifyContent="flex-end"
      gap={'8px'}
      flexWrap="wrap"
    >
      {children}
    </Box>
  );
};

export default BaseFooter;
