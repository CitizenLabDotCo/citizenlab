import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

interface Props {
  children: React.ReactNode;
}

const LabelContentWrapper = ({ children }: Props) => {
  return (
    <Box
      display="flex"
      width="100%"
      justifyContent="space-between"
      alignItems="center"
    >
      {children}
    </Box>
  );
};

export default LabelContentWrapper;
