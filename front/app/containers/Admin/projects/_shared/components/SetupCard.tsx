import React, { ReactNode } from 'react';

import { Box, Text, bo, colors } from '@citizenlab/cl2-component-library';

interface Props {
  title: string;
  action?: ReactNode;
  children?: ReactNode;
}

const SetupCard = ({ title, action, children }: Props) => (
  <Box
    as="section"
    display="flex"
    flexDirection="column"
    border={`1px solid ${colors.grey200}`}
    borderRadius={bo.borderRadius}
  >
    <Box
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      gap="10px"
      minHeight="44px"
      p="8px 8px 8px 12px"
    >
      <Box as="h3" m="0">
        <Text as="span" variant="boControl" fontSize="xs" m="0">
          {title}
        </Text>
      </Box>
      {action}
    </Box>
    {children && (
      <Box display="flex" flexDirection="column" gap="12px" p="2px 12px 14px">
        {children}
      </Box>
    )}
  </Box>
);

export default SetupCard;
