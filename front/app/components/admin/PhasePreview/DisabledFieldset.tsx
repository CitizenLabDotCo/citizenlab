import React, { ReactNode } from 'react';

import { Box } from '@citizenlab/cl2-component-library';

// Shows actions as they will look while making every control inside inert.
const DisabledFieldset = ({ children }: { children: ReactNode }) => (
  <Box as="fieldset" disabled border="none" p="0" m="0" minWidth="0">
    {children}
  </Box>
);

export default DisabledFieldset;
