import { Box, colors, stylingConsts } from '@citizenlab/cl2-component-library';
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { FocusOn } from 'react-focus-on';
import TopBar from './TopBar';
import Tags from './Tags';
import InputsList from './InputsList';
import InputPreview from './InputPreview';
import Tasks from './Tasks';
import Insights from './Insights';

const Analysis = () => {
  const modalPortalElement = document.getElementById('modal-portal');

  const [selectedInputId, setSelectedInputId] = useState<string | null>(null);

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
            overflow="auto"
            h={`calc(100vh - ${stylingConsts.mobileMenuHeight}px)`}
            p="12px"
            mt="12px"
            bg={colors.white}
          >
            <InputsList
              onSelectInput={setSelectedInputId}
              selectedInputId={selectedInputId}
            />
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
              {selectedInputId && <InputPreview inputId={selectedInputId} />}
            </Box>
            <Box h="60px">
              <Tasks />
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
            <Insights onSelectInput={setSelectedInputId} />
          </Box>
        </Box>
      </FocusOn>
    </Box>,
    modalPortalElement
  );
};

export default Analysis;
