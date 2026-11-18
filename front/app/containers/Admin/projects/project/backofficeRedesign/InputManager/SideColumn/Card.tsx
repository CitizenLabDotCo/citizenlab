import React, { ReactNode } from 'react';

import { bo, Box, colors } from '@citizenlab/cl2-component-library';

interface Props {
  fillHeight?: boolean;
  children: ReactNode;
}

const Card = ({ fillHeight = false, children }: Props) => (
  <Box
    display="flex"
    flexDirection="column"
    flexGrow={fillHeight ? 1 : undefined}
    gap="12px"
    p="16px"
    borderRadius={bo.panelBorderRadius}
    background={colors.white}
  >
    {children}
  </Box>
);

export default Card;
