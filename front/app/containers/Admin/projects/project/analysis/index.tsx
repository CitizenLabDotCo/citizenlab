import { Box, colors } from '@citizenlab/cl2-component-library';
import React from 'react';
import { createPortal } from 'react-dom';
import { FocusOn } from 'react-focus-on';
import TopBar from './TopBar';
import Tags from './Tags';

const Analysis = () => {
  const modalPortalElement = document.getElementById('modal-portal');
  if (!modalPortalElement) return null;

  return createPortal(
    <Box
      display="flex"
      flexDirection="column"
      w="100%"
      zIndex="10000"
      position="fixed"
      bgColor={colors.background}
      h="100vh"
      data-testid="contentBuilderPage"
    >
      <FocusOn>
        <TopBar />
        <Box mt="100px" display="flex" w="100" alignItems="stretch" gap="20px">
          <Box flexGrow={1}>Insights</Box>
          <Box w="300px">
            <Tags />
          </Box>
          <Box flexGrow={1}>Inputs </Box>
          <Box flexGrow={1}>Preview</Box>
        </Box>
      </FocusOn>
    </Box>,
    modalPortalElement
  );
};

export default Analysis;
