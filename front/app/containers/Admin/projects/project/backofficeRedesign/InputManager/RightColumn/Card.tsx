import React, { ReactNode } from 'react';

import { bo, Box, colors, Text } from '@citizenlab/cl2-component-library';

interface Props {
  title: string;
  children: ReactNode;
}

const Card = ({ title, children }: Props) => (
  <Box
    border={`1px solid ${colors.grey300}`}
    borderRadius={bo.panelBorderRadius}
    p="16px"
  >
    <Text variant="boSection" m="0" mb="12px">
      {title}
    </Text>
    {children}
  </Box>
);

export default Card;
