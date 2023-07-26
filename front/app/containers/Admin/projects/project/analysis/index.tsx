import { Box, colors, stylingConsts } from '@citizenlab/cl2-component-library';
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
    >
      <FocusOn>
        <TopBar />
        <Box
          display="flex"
          w="100"
          alignItems="stretch"
          gap="20px"
          pt={`${stylingConsts.mobileMenuHeight}px`}
        >
          <Box flexGrow={1} p="12px">
            Insights
          </Box>
          <Box
            w="300px"
            overflow="auto"
            h={`calc(100vh - ${stylingConsts.mobileMenuHeight}px)`}
            p="12px"
          >
            <Tags />
          </Box>
          <Box flexGrow={1} p="12px">
            Inputs
          </Box>
          <Box flexGrow={1} p="12px">
            Preview
          </Box>
        </Box>
      </FocusOn>
    </Box>,
    modalPortalElement
  );
};

export default Analysis;
