import React from 'react';
import { createPortal } from 'react-dom';
import { FocusOn } from 'react-focus-on';

// components
import { Box } from '@citizenlab/cl2-component-library';
import TopBar from './TopBar';
import ImportSection from './ImportSection';
import ReviewSection from './ReviewSection';

// styling
import { colors } from 'utils/styleUtils';

const OfflineInputImporter = () => {
  return (
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
        <ImportSection />
        <ReviewSection />
      </FocusOn>
    </Box>
  );
};

const OfflineInputImporterWrapper = () => {
  const modalPortalElement = document.getElementById('modal-portal');
  if (!modalPortalElement) return null;

  return createPortal(<OfflineInputImporter />, modalPortalElement);
};

export default OfflineInputImporterWrapper;
