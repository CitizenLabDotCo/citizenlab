import React from 'react';
import { Box, colors } from '@citizenlab/cl2-component-library';

interface Props {
  children: React.ReactNode;
}

const WhiteBox = ({ children }: Props) => (
  <Box
    display="flex"
    flexDirection="column"
    alignItems="stretch"
    background={colors.white}
    padding="24px"
  >
    {children}
  </Box>
);

export default WhiteBox;
