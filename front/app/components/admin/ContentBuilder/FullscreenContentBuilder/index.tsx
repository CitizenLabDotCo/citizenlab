import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FocusOn } from 'react-focus-on';

// styling
import { colors } from 'utils/styleUtils';

// components
import { Box } from '@citizenlab/cl2-component-library';

// utils
import { Locale } from 'typings';
import eventEmitter from 'utils/eventEmitter';
import {
  CONTENT_BUILDER_DELETE_ELEMENT_EVENT,
  CONTENT_BUILDER_ERROR_EVENT,
  IMAGE_UPLOADING_EVENT,
} from '../constants';

type ContentBuilderErrors = Record<
  string,
  { hasError: boolean; selectedLocale: Locale }
>;

interface Props {
  onErrors: (errors: ContentBuilderErrors) => void;
  onDeleteElement: (id: string) => void;
  onUploadImage: (imageUploading: boolean) => void;
  children: React.ReactNode;
}

export const ContentBuilder = ({
  onErrors,
  onDeleteElement,
  onUploadImage,
  children,
}: Props) => {
  useEffect(() => {
    const subscription = eventEmitter
      .observeEvent(CONTENT_BUILDER_ERROR_EVENT)
      .subscribe(({ eventValue }) => {
        onErrors(eventValue as ContentBuilderErrors);
      });
    return () => {
      subscription.unsubscribe();
    };
  }, [onErrors]);

  useEffect(() => {
    const subscription = eventEmitter
      .observeEvent(CONTENT_BUILDER_DELETE_ELEMENT_EVENT)
      .subscribe(({ eventValue }) => {
        const deletedElementId = eventValue as string;
        onDeleteElement(deletedElementId);
      });
    return () => {
      subscription.unsubscribe();
    };
  }, [onDeleteElement]);

  useEffect(() => {
    const subscription = eventEmitter
      .observeEvent(IMAGE_UPLOADING_EVENT)
      .subscribe(({ eventValue }) => {
        const uploadingValue = eventValue as boolean;
        onUploadImage(uploadingValue);
      });
    return () => {
      subscription.unsubscribe();
    };
  }, [onUploadImage]);

  return (
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
      <FocusOn>{children}</FocusOn>
    </Box>
  );
};

const FullscreenContentBuilder = (props: Props) => {
  const modalPortalElement = document.getElementById('modal-portal');
  return modalPortalElement
    ? createPortal(<ContentBuilder {...props} />, modalPortalElement)
    : null;
};

export default FullscreenContentBuilder;
