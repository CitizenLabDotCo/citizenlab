import React from 'react';

// components
import PDFWrapper from './PDFWrapper';
import { Box } from '@citizenlab/cl2-component-library';

// constants
import { MAX_REPORT_WIDTH } from 'containers/Admin/reporting/constants';

// typings
import { View } from './typings';

interface Props {
  view: View;
  children: React.ReactNode;
}

const ViewContainer = ({ view, children }: Props) => {
  if (view === 'pdf') {
    return <PDFWrapper>{children}</PDFWrapper>;
  }

  return (
    <Box
      height="620px"
      border="solid black"
      borderWidth="40px 20px 20px 20px"
      zIndex="1"
      mb="12px"
      width={view === 'phone' ? '360px' : '1140px'}
      py={view === 'phone' ? '20px' : '40px'}
      borderRadius="20px"
      overflowX="hidden"
      overflowY="scroll"
      background="white"
      display="flex"
      alignItems="center"
      flexDirection="column"
    >
      <Box maxWidth={MAX_REPORT_WIDTH} w="100%">
        {children}
      </Box>
    </Box>
  );
};

export default ViewContainer;
