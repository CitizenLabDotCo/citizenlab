import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FocusOn } from 'react-focus-on';

// components
import { Box } from '@citizenlab/cl2-component-library';

// types
import { SerializedNodes } from '@craftjs/core';
import { Locale } from 'typings';

interface Props {
  onUpdateDraftData: (serializedNodes: SerializedNodes | undefined) => void;
  onUpdateLocale: (locale: Locale) => void;
  children: React.ReactNode;
}

export const FullScreenPreviewWrapper = ({
  onUpdateDraftData,
  onUpdateLocale,
  children,
}: Props) => {
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      // Make sure there is a root node in the draft data
      if (e.origin === window.location.origin && e.data.ROOT) {
        onUpdateDraftData(e.data);
      }
      if (e.origin === window.location.origin && e.data.selectedLocale) {
        onUpdateLocale(e.data.selectedLocale);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [onUpdateDraftData, onUpdateLocale]);

  return (
    <FocusOn>
      <Box
        display="flex"
        flexDirection="column"
        w="100%"
        zIndex="10000"
        position="fixed"
        height="100vh"
        bgColor="#fff"
        overflowY="auto"
        data-testid="contentBuilderEditModePreviewContent"
      >
        <Box p="20px">{children}</Box>
      </Box>
    </FocusOn>
  );
};

const FullScreenPreviewWrapperModal = (props: Props) => {
  const modalPortalElement = document.getElementById('modal-portal');

  return modalPortalElement
    ? createPortal(<FullScreenPreviewWrapper {...props} />, modalPortalElement)
    : null;
};
export default FullScreenPreviewWrapperModal;
