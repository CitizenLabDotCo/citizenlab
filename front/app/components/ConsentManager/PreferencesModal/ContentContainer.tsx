import React from 'react';

// components
import { Box, useBreakpoint } from '@citizenlab/cl2-component-library';

interface Props {
  id?: string;
  role?: 'dialog';
  children: React.ReactNode;
}

const ContentContainer = ({ id, role, children }: Props) => {
  const smallerThanPhone = useBreakpoint('phone');

  return (
    <Box
      id={id}
      role={role}
      padding={smallerThanPhone ? '20px' : '30px'}
      background="white"
      margin={smallerThanPhone ? '0' : undefined}
    >
      {children}
    </Box>
  );
};

export default ContentContainer;
