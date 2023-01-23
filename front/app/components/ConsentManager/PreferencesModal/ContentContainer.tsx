import React from 'react';

// components
import { Box, useBreakpoint } from '@citizenlab/cl2-component-library';

interface Props {
  id?: string;
  role?: 'dialog';
  'aria-modal'?: boolean;
  children: React.ReactNode;
}

const ContentContainer = ({ children, ...props }: Props) => {
  const phone = useBreakpoint('phone');

  return (
    <Box
      {...props}
      padding={phone ? '20px' : '30px'}
      background="white"
      margin={phone ? '0' : undefined}
    >
      {children}
    </Box>
  );
};

export default ContentContainer;
