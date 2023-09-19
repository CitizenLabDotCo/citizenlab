import React from 'react';
import { Box } from '@citizenlab/cl2-component-library';
import { colors } from 'utils/styleUtils';

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
