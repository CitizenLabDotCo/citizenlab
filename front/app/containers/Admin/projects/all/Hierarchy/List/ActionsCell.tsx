import React, { ReactNode } from 'react';

import { Box, Td } from '@citizenlab/cl2-component-library';

interface Props {
  children: ReactNode;
}

// The row's "⋯", in the column under the header's "+".
const ActionsCell = ({ children }: Props) => (
  <Td px="4px">
    <Box
      data-actions
      position="relative"
      zIndex="1"
      display="flex"
      justifyContent="center"
    >
      {children}
    </Box>
  </Td>
);

export default ActionsCell;
