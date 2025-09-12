import React, { useState, useEffect, useRef } from 'react';

import { Box, Spinner } from '@citizenlab/cl2-component-library';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { CLErrors, UploadFile } from 'typings';

import { IFileAttachmentData } from 'api/file_attachments/types';
import { IFileData } from 'api/files/types';

import { List } from 'components/admin/ResourceList';
import SortableRow from 'components/admin/ResourceList/SortableRow';
import Error from 'components/UI/Error';

import FileSelectOrUploadModal from './components/FileSelectOrUploadModal';
import ScreenReaderFilesList from './components/ScreenReaderFilesList';
import FileAttachmentDisplay from './FileAttachmentDisplay';

export interface Props {
  id: string;
  className?: string;
  onFileAdd: (fileToAdd: UploadFile) => void;
  onFileRemove?: (fileAttachmentToRemove: IFileAttachmentData) => void;
  onFileReorder?: (updatedFiles: IFileAttachmentData[]) => void;
  onFileAttach?: (fileToAttach: IFileData) => void;
  fileAttachments?: IFileAttachmentData[] | undefined;
  apiErrors?: CLErrors | null;
  enableDragAndDrop?: boolean;
  maxSizeMb?: number;
  dataCy?: string;
  isUploadingFile?: boolean;
}

const FileRepositorySelectAndUpload = ({
  onFileAdd,
  onFileRemove,
  onFileReorder,
  onFileAttach,
  fileAttachments: initialFileAttachments,
  apiErrors,
  id,
  className,
  enableDragAndDrop = false,
  maxSizeMb,
  dataCy,
  isUploadingFile,
}: Props) => {
  const [fileAttachments, setFileAttachments] = useState(
    initialFileAttachments
  );

  // Track if we're currently dragging to prevent conflicts
  const isDragging = useRef(false);

  useEffect(() => {
    if (initialFileAttachments && !isDragging.current) {
      setFileAttachments(initialFileAttachments);
    }
  }, [initialFileAttachments]);

  const handleFileOnAdd = (fileToAdd: UploadFile) => {
    onFileAdd(fileToAdd);
  };

  const handleFileOnAttach = (fileToAttach: IFileData) => {
    onFileAttach?.(fileToAttach);
  };

  const handleFileOnRemove =
    (fileAttachmentToRemove: IFileAttachmentData) =>
    (event: React.FormEvent) => {
      event.preventDefault();
      event.stopPropagation();
      onFileRemove?.(fileAttachmentToRemove);
    };

  const handleDragRow = (fromIndex: number, toIndex: number) => {
    isDragging.current = true;

    setFileAttachments((prevFileAttachments) => {
      if (!prevFileAttachments) return prevFileAttachments;

      // Create a copy of the file attachments array
      const fileAttachmentsCopy = [...prevFileAttachments];

      // Remove the file attachment from its original position and store it
      const [movedFileAttachment] = fileAttachmentsCopy.splice(fromIndex, 1);

      // Insert the file attachment at its new position
      fileAttachmentsCopy.splice(toIndex, 0, movedFileAttachment);

      // Update positions (order values) for the file attachments
      const fileAttachmentsUpdatedPositions = fileAttachmentsCopy.map(
        (fileAttachment, index) =>
          fileAttachment.attributes.position !== index
            ? {
                ...fileAttachment,
                attributes: {
                  ...fileAttachment.attributes,
                  position: index,
                },
              }
            : fileAttachment
      );

      onFileReorder?.(fileAttachmentsUpdatedPositions);
      return fileAttachmentsUpdatedPositions;
    });
  };

  // Reset dragging flag when drag ends
  const handleDragEnd = () => {
    isDragging.current = false;
  };

  const content = (
    <Box
      className={className}
      key={id}
      data-cy="e2e-file-uploader-container"
      w="100%"
    >
      <FileSelectOrUploadModal
        fileAttachments={fileAttachments}
        id={id}
        onFileAdd={handleFileOnAdd}
        onFileAttach={handleFileOnAttach}
        maxSizeMb={maxSizeMb}
        dataCy={dataCy}
        isDisabled={isUploadingFile}
      />

      <Error fieldName="file" apiErrors={apiErrors?.file} />

      <List key={fileAttachments?.length} className="files-list e2e-files-list">
        {fileAttachments?.map(
          (fileAttachment: IFileAttachmentData, index: number) =>
            enableDragAndDrop ? (
              <SortableRow
                key={`item-${fileAttachment.id}-row`}
                id={fileAttachment.id}
                index={index}
                moveRow={handleDragRow}
                dropRow={handleDragEnd}
                isLastItem={index === fileAttachments.length - 1}
              >
                <Box w="100%">
                  <FileAttachmentDisplay
                    key={`item-${fileAttachment.id}-display`}
                    onDeleteClick={handleFileOnRemove(fileAttachment)}
                    fileAttachment={fileAttachment}
                  />
                </Box>
              </SortableRow>
            ) : (
              <Box key={`item-${fileAttachment.id}-display`} w="100%">
                <FileAttachmentDisplay
                  onDeleteClick={handleFileOnRemove(fileAttachment)}
                  fileAttachment={fileAttachment}
                />
              </Box>
            )
        )}
      </List>
      {isUploadingFile && <Spinner />}

      <ScreenReaderFilesList fileAttachments={fileAttachments} />
    </Box>
  );

  return enableDragAndDrop ? (
    <DndProvider backend={HTML5Backend}>{content}</DndProvider>
  ) : (
    content
  );
};

export default FileRepositorySelectAndUpload;
