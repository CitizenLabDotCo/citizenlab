import React from 'react';

import { Box, useBreakpoint } from '@citizenlab/cl2-component-library';

interface Props {
  id?: string;
  role?: 'dialog';
  'aria-modal'?: boolean;
  children: React.ReactNode;
}

const CookieModalContentContainer = ({ children, ...props }: Props) => {
  const isSmallerThanPhone = useBreakpoint('phone');

  return (
    <Box
      {...props}
      padding={isSmallerThanPhone ? '20px' : '30px'}
      background="white"
      margin={isSmallerThanPhone ? '0' : undefined}
    >
      {children}
    </Box>
  );
};

export default CookieModalContentContainer;
