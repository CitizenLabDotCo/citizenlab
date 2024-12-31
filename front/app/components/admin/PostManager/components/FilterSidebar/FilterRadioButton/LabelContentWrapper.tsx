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
      // This is needed to ensure buttons of the same height.
      // The 'All filters' button, for example, is less tall than the phase filters
      // that have a circled phase number.
      // (This could perhaps be moved to phase filter specific components if it turns out the others don't need it.)
      height="24px"
    >
      {children}
    </Box>
  );
};

export default LabelContentWrapper;
