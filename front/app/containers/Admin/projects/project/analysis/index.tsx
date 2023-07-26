import { Box, colors } from '@citizenlab/cl2-component-library';
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { FocusOn } from 'react-focus-on';
import TopBar from './TopBar';
import InputsList from './InputsList';
import InputPreview from './InputPreview';

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
      data-testid="contentBuilderPage"
    >
      <FocusOn>
        <TopBar />
        <Box mt="100px" display="flex" w="100" alignItems="stretch" gap="20px">
          <Box flex="1">Insights</Box>
          <Box w="300px">Tags</Box>
          <Box flex="1">
            <InputsList
              onSelectInput={(inputId) => setSelectedInputId(inputId)}
              selectedInputId={selectedInputId}
            />
          </Box>
          <Box flex="1">
            {selectedInputId && <InputPreview inputId={selectedInputId} />}
          </Box>
        </Box>
      </FocusOn>
    </Box>,
    modalPortalElement
  );
};

export default Analysis;
