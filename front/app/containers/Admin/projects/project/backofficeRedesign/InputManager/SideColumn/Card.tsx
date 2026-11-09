import React, { ReactNode } from 'react';

import { bo, Box, colors, Text } from '@citizenlab/cl2-component-library';

interface Props {
  title?: string;
  fillHeight?: boolean;
  children: ReactNode;
}

// One white panel in the Manage side column.
const Card = ({ title, fillHeight = false, children }: Props) => (
  <Box
    display="flex"
    flexDirection="column"
    flexGrow={fillHeight ? 1 : undefined}
    gap="12px"
    p="16px"
    borderRadius={bo.panelBorderRadius}
    background={colors.white}
  >
    {title && (
      <Text variant="boSection" m="0">
        {title}
      </Text>
    )}
    {children}
  </Box>
);

export default Card;
