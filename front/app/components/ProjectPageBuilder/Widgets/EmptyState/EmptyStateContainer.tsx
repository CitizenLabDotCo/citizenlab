import React from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';

type Props = {
  id?: string;
  children: React.ReactNode;
};

// Dashed placeholder for widgets with no data yet; only rendered to
// admins/moderators, never to residents.
const EmptyStateContainer = ({ id, children }: Props) => (
  <Box
    id={id}
    border={`1px dashed ${colors.borderLight}`}
    borderRadius="4px"
    p="32px"
    display="flex"
    flexDirection="column"
    alignItems="center"
    gap="16px"
  >
    {children}
  </Box>
);

export default EmptyStateContainer;
