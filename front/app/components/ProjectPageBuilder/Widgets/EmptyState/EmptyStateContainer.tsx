import React from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';

type Props = {
  id?: string;
  children: React.ReactNode;
};

// Dashed, centered placeholder used by the project-page widgets when they have
// no data yet. Only rendered for admins/moderators (see useCanModerateProject),
// so residents never see it.
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
