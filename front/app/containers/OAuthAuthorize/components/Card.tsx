import React from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';

// A single white card used by every state (loading / sign-in / error / consent).
const Card = ({ children }: { children: React.ReactNode }) => (
  <Box
    display="flex"
    width="100%"
    maxWidth="720px"
    background={colors.white}
    borderRadius="12px"
    border={`1px solid ${colors.borderLight}`}
    boxShadow="0px 4px 24px rgba(0, 0, 0, 0.06)"
    overflow="hidden"
    justifyContent="center"
  >
    {children}
  </Box>
);

export default Card;
