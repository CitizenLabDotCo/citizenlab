import React, { useState, useEffect, useRef } from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { CLErrors, UploadFile } from 'typings';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { List } from 'components/admin/ResourceList';
import SortableRow from 'components/admin/ResourceList/SortableRow';
import Error from 'components/UI/Error';

import { ScreenReaderOnly } from 'utils/a11y';
import { FormattedMessage } from 'utils/cl-intl';

import DataRepositoryFileSelector from './DataRepositoryFileSelector';
import FileDisplay, { FileType } from './FileDisplay';
import FileInput from './FileInput';
import messages from './messages';

export interface Props {
  id: string;
  className?: string;
  onFileAdd: (fileToAdd: UploadFile) => void;
  onFileRemove?: (fileToRemove: FileType) => void;
  onFileReorder?: (updatedFiles: FileType[]) => void;
  onFileAddFromRepository?: (files: FileType[]) => void;
  files: FileType[] | null;
  apiErrors?: CLErrors | null;
  enableDragAndDrop?: boolean;
  multiple?: boolean;
  maxSizeMb?: number;
  dataCy?: string;
  allowFromDataRepository?: boolean; // Whether to allow selecting files from the data repository
}

const FileUploader = ({
  onFileAdd,
  onFileRemove,
  onFileReorder,
  allowFromDataRepository = false,
  onFileAddFromRepository,
  files: initialFiles,
  apiErrors,
  id,
  className,
  enableDragAndDrop = false,
  multiple = false,
  maxSizeMb,
  dataCy,
}: Props) => {
  const [files, setFiles] = useState<FileType[]>(initialFiles || []);

  const isDataRepositoryEnabled = useFeatureFlag({
    name: 'data_repository',
  });

  // Track if we're currently dragging to prevent conflicts
  const isDragging = useRef(false);

  useEffect(() => {
    if (initialFiles && !isDragging.current) {
      setFiles(initialFiles);
    }
  }, [initialFiles]);

  const handleFileOnAdd = (fileToAdd: UploadFile) => {
    if (!files.find((file) => file.base64 === fileToAdd.base64)) {
      const updatedFiles = [...files, fileToAdd as FileType];
      setFiles(updatedFiles);
      onFileAdd(fileToAdd);
    }
  };

  const handleFileOnRemove =
    (fileToRemove: FileType) => (event: React.FormEvent) => {
      event.preventDefault();
      event.stopPropagation();
      const updatedFiles = files.filter((file) => file.id !== fileToRemove.id);
      setFiles(updatedFiles);
      onFileRemove?.(fileToRemove);
    };

  const handleDragRow = (fromIndex: number, toIndex: number) => {
    isDragging.current = true;

    setFiles((prevFiles) => {
      // Create a copy of the files array
      const filesCopy = [...prevFiles];

      // Remove the file from its original position and store it
      const [movedFile] = filesCopy.splice(fromIndex, 1);

      // Insert the file at its new position
      filesCopy.splice(toIndex, 0, movedFile);

      filesCopy.forEach((file, index) => {
        file.ordering = index;
      });

      // Notify parent component about the change
      onFileReorder?.(filesCopy);
      return filesCopy;
    });
  };

  // Reset dragging flag when drag ends
  const handleDragEnd = () => {
    isDragging.current = false;
  };

  const fileNames = files.map((file) => file.name).join(', ');

  const content = (
    <Box
      className={className}
      key={id}
      data-cy="e2e-file-uploader-container"
      w="100%"
    >
      <>
        {isDataRepositoryEnabled && allowFromDataRepository && (
          // Select from the existing file library.
          <Box mb="12px">
            <DataRepositoryFileSelector
              onFileAddFromRepository={onFileAddFromRepository}
              files={files}
            />
          </Box>
        )}
        <FileInput
          onAdd={handleFileOnAdd}
          id={id}
          multiple={multiple}
          maxSizeMb={maxSizeMb}
          dataCy={dataCy}
        />
      </>
      <Error fieldName="file" apiErrors={apiErrors?.file} />

      <List key={files.length} className="files-list e2e-files-list">
        {files.map((file: FileType, index: number) =>
          enableDragAndDrop ? (
            <SortableRow
              key={`item-${file.name}-${file.id}-row`}
              id={file.id || file.name}
              index={index}
              moveRow={handleDragRow}
              dropRow={handleDragEnd}
              isLastItem={index === files.length - 1}
            >
              <Box w="100%">
                <FileDisplay
                  key={`item-${file.name}-${file.id}-display`}
                  onDeleteClick={handleFileOnRemove(file)}
                  file={file}
                />
              </Box>
            </SortableRow>
          ) : (
            <Box key={`item-${file.name}-${file.id}`} w="100%">
              <FileDisplay
                key={`item-${file.id || file.name}-display`}
                onDeleteClick={handleFileOnRemove(file)}
                file={file}
              />
            </Box>
          )
        )}
      </List>

      <ScreenReaderOnly aria-live="polite">
        <FormattedMessage
          {...(files.length > 0
            ? messages.a11y_filesToBeUploaded
            : messages.a11y_noFiles)}
          values={{ fileNames }}
        />
      </ScreenReaderOnly>
    </Box>
  );

  return enableDragAndDrop ? (
    <DndProvider backend={HTML5Backend}>{content}</DndProvider>
  ) : (
    content
  );
};

export default FileUploader;
