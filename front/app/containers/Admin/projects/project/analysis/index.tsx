import React from 'react';

import { Box, colors, stylingConsts } from '@citizenlab/cl2-component-library';
import { createPortal } from 'react-dom';
import { FocusOn } from 'react-focus-on';

import Comments from './Comments';
import InputPreview from './InputPreview';
import InputsList from './InputsList';
import Insights from './Insights';
import SelectedInputContext from './SelectedInputContext';
import Tags from './Tags';
import TopBar from './TopBar';

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
              h={`calc(100vh - ${stylingConsts.mobileMenuHeight}px)`}
              mt="12px"
              bg={colors.white}
            >
              <Tags />
            </Box>

            <Box flex="1" mt="12px">
              <InputsList />
            </Box>

            <Box flex="1" mt="12px">
              <Box
                overflow="auto"
                h={`calc(100vh - ${stylingConsts.mobileMenuHeight}px - 72px)`}
                display="flex"
                flexDirection="column"
                bg={colors.white}
              >
                <Box flex="1" bg={colors.white} px="12px" pt="12px">
                  <InputPreview />
                </Box>
              </Box>
              <Box bg={colors.white} mt="6px">
                <Comments />
              </Box>
            </Box>

            <Box
              flex="1"
              p="12px"
              mt="12px"
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
