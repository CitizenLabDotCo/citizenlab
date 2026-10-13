import React, { ReactNode } from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';

import useProjectBackofficeRedesign from 'hooks/useProjectBackofficeRedesign';

const DOTTED_BACKGROUND = `radial-gradient(circle at 1px 1px, rgba(0, 0, 0, 0.04) 1px, transparent 0) 0 0 / 18px 18px, ${colors.background}`;

// The area behind a phone preview that fills a project tab.
const PhonePreviewBackdrop = ({ children }: { children: ReactNode }) => {
  const redesign = useProjectBackofficeRedesign();

  return (
    <Box h="100%" background={redesign ? colors.grey100 : DOTTED_BACKGROUND}>
      {children}
    </Box>
  );
};

export default PhonePreviewBackdrop;
