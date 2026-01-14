import React, { useEffect } from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';
import { SupportedLocale } from 'typings';

import useDeleteFileAttachment from 'api/file_attachments/useDeleteFileAttachment';

import eventEmitter from 'utils/eventEmitter';

import {
  CONTENT_BUILDER_DELETE_ELEMENT_EVENT,
  CONTENT_BUILDER_ERROR_EVENT,
  IMAGE_UPLOADING_EVENT,
} from '../constants';
import { SelectedNode } from '../Settings/typings';

type ContentBuilderErrors = Record<
  string,
  { hasError: boolean; selectedLocale?: SupportedLocale }
>;

interface Props {
  onErrors?: (errors: ContentBuilderErrors) => void;
  onDeleteElement?: (id: string) => void;
  onUploadImage: (imageUploading: boolean) => void;
  children: React.ReactNode;
}

export const ContentBuilder = ({
  onErrors,
  onDeleteElement,
  onUploadImage,
  children,
}: Props) => {
  const { mutate: deleteFileAttachment } = useDeleteFileAttachment({});

  useEffect(() => {
    if (!onErrors) return;

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
    if (!onDeleteElement) return;

    const cleanUpElementAfterDeletion = (deletedElement: SelectedNode) => {
      // Add additional cleanup logic below for other element types as needed.

      // File Attachment
      if (deletedElement.custom?.title.defaultMessage === 'File Attachment') {
        const fileAttachmentId = deletedElement.props.fileAttachmentId;
        deleteFileAttachment(fileAttachmentId);
      }
    };

    const subscription = eventEmitter
      .observeEvent(CONTENT_BUILDER_DELETE_ELEMENT_EVENT)
      .subscribe(({ eventValue }) => {
        const deletedElement = eventValue as SelectedNode;

        cleanUpElementAfterDeletion(deletedElement);

        const deletedElementId = deletedElement.id;
        onDeleteElement(deletedElementId);
      });
    return () => {
      subscription.unsubscribe();
    };
  }, [deleteFileAttachment, onDeleteElement]);

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
      position="fixed"
      bgColor={colors.background}
      h="100vh"
      data-testid="contentBuilderPage"
    >
      {children}
    </Box>
  );
};

export default ContentBuilder;
