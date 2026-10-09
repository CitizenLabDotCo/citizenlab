import React, { ReactNode } from 'react';

import { Box, Text, bo, colors } from '@citizenlab/cl2-component-library';

interface Props {
  title: string;
  children: ReactNode;
}

const SetupCard = ({ title, children }: Props) => (
  <Box
    as="section"
    display="flex"
    flexDirection="column"
    gap="12px"
    p="16px"
    border={`1px solid ${colors.grey300}`}
    borderRadius={bo.borderRadius}
  >
    <Box as="h3" m="0">
      <Text as="span" variant="boSection" m="0">
        {title}
      </Text>
    </Box>
    {children}
  </Box>
);

export default SetupCard;
