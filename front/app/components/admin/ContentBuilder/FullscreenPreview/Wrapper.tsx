import React, { useEffect } from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { SerializedNodes } from '@craftjs/core';
import { createPortal } from 'react-dom';
import { FocusOn } from 'react-focus-on';
import styled from 'styled-components';
import { SupportedLocale } from 'typings';

import { DEFAULT_PADDING } from '../constants';

interface Props {
  onUpdateDraftData?: (serializedNodes: SerializedNodes | undefined) => void;
  onUpdateLocale?: (locale: SupportedLocale) => void;
  children: React.ReactNode;
  padding?: string;
}

export const StyledPreviewBox = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  z-index: 10000;
  position: absolute;
  height: 100vh;
  background-color: #fff;
  overflow-y: auto;
  @media print {
    overflow-y: visible;
  }
`;

export const FullScreenPreviewWrapper = ({
  onUpdateDraftData,
  onUpdateLocale,
  children,
  padding,
}: Props) => {
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      // Make sure there is a root node in the draft data
      if (e.origin === window.location.origin && e.data.ROOT) {
        onUpdateDraftData?.(e.data);
      }
      if (
        onUpdateLocale &&
        e.origin === window.location.origin &&
        e.data.selectedLocale
      ) {
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
      <StyledPreviewBox data-testid="contentBuilderEditModePreviewContent">
        <Box p={padding || DEFAULT_PADDING}>{children}</Box>
      </StyledPreviewBox>
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
