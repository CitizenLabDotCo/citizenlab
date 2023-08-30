import { Box, colors, stylingConsts } from '@citizenlab/cl2-component-library';
import React from 'react';
import { createPortal } from 'react-dom';
import { FocusOn } from 'react-focus-on';
import TopBar from './TopBar';
import Tags from './Tags';
import InputsList from './InputsList';
import InputPreview from './InputPreview';
import Insights from './Insights';
import SelectedInputContext from './SelectedInputContext';
import Demographics from './Demographics';

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
        <SelectedInputContext>
          <TopBar />
          <Box
            display="flex"
            w="100"
            alignItems="stretch"
            gap="8px"
            pt={`${stylingConsts.mobileMenuHeight}px`}
          >
            <Box
              w="300px"
              overflow="auto"
              h={`calc(100vh - ${stylingConsts.mobileMenuHeight}px)`}
              p="12px"
              mt="12px"
              bg={colors.white}
            >
              <Tags />
            </Box>
            <Box
              flex="1"
              h={`calc(100vh - ${stylingConsts.mobileMenuHeight}px)`}
              display="flex"
              flexDirection="column"
              minWidth="0"
            >
              <Box mt="12px" bg={colors.white}>
                <Demographics />
              </Box>
              <Box flex="1" overflow="auto" p="12px" mt="8px" bg={colors.white}>
                <InputsList />
              </Box>
            </Box>
            <Box
              flex="1"
              overflow="auto"
              h={`calc(100vh - ${stylingConsts.mobileMenuHeight}px)`}
              p="12px"
              mt="12px"
              display="flex"
              flexDirection="column"
              bg={colors.white}
            >
              <Box flex="1">
                <InputPreview />
              </Box>
            </Box>
            <Box
              flex="1"
              p="12px"
              mt="12px"
              overflow="auto"
              h={`calc(100vh - ${stylingConsts.mobileMenuHeight}px)`}
              bg={colors.white}
            >
              <Insights />
            </Box>
          </Box>
        </SelectedInputContext>
      </FocusOn>
    </Box>,
    modalPortalElement
  );
};

export default Analysis;
