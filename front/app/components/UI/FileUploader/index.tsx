import React, { useState, useEffect } from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { CLErrors, UploadFile } from 'typings';

import { List } from 'components/admin/ResourceList';
import SortableRow from 'components/admin/ResourceList/SortableRow';
import Error from 'components/UI/Error';

import { ScreenReaderOnly } from 'utils/a11y';
import { FormattedMessage } from 'utils/cl-intl';

import FileDisplay, { FileType } from './FileDisplay';
import FileInput from './FileInput';
import messages from './messages';

export interface Props {
  id: string;
  className?: string;
  onFileAdd: (fileToAdd: UploadFile) => void;
  onFileRemove?: (fileToRemove: FileType) => void;
  onFileReorder?: (updatedFiles: FileType[]) => void;
  files: FileType[] | null;
  apiErrors?: CLErrors | null;
  enableDragAndDrop?: boolean;
  multiple?: boolean;
}

const FileUploader = ({
  onFileAdd,
  onFileRemove,
  onFileReorder,
  files: initialFiles,
  apiErrors,
  id,
  className,
  enableDragAndDrop = false,
  multiple = false,
}: Props) => {
  const [files, setFiles] = useState<FileType[]>(initialFiles || []);

  useEffect(() => {
    if (initialFiles) {
      setFiles(initialFiles);
    }
  }, [initialFiles]);

  const handleFileOnAdd = (fileToAdd: UploadFile) => {
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!files?.find((file) => file.base64 === fileToAdd.base64)) {
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
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (files) {
      const updatedFiles = [...files];
      const [movedFile] = updatedFiles.splice(fromIndex, 1);
      updatedFiles.splice(toIndex, 0, movedFile);

      updatedFiles.forEach((file, index) => {
        file.ordering = index;
      });

      setFiles(updatedFiles);
      onFileReorder?.(updatedFiles);
    }
  };

  const fileNames = files.map((file) => file.name).join(', ');

  const content = (
    <Box
      className={className}
      key={id}
      data-cy="e2e-file-uploader-container"
      w="100%"
    >
      <FileInput onAdd={handleFileOnAdd} id={id} multiple={multiple} />
      <Error fieldName="file" apiErrors={apiErrors?.file} />

      <List key={files.length} className="files-list e2e-files-list">
        {files.map((file: FileType, index: number) =>
          enableDragAndDrop ? (
            <SortableRow
              key={`item-${file.id || file.name}`}
              id={file.id || file.name}
              index={index}
              moveRow={handleDragRow}
              isLastItem={index === files.length - 1}
            >
              <Box w="100%">
                <FileDisplay
                  key={`item-${file.id || file.name}`}
                  onDeleteClick={handleFileOnRemove(file)}
                  file={file}
                />
              </Box>
            </SortableRow>
          ) : (
            <Box key={`item-${file.id || file.name}`} w="100%">
              <FileDisplay
                key={`item-${file.id || file.name}`}
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
