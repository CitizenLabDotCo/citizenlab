import React, { useState } from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import FilesUpload from 'containers/Admin/projects/project/files/components/FilesUpload';

import Modal from '../Modal';

import SelectExistingFile from './components/SelectExistingFile';
import { FileType } from './FileDisplay';

type Props = {
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  files?: FileType[];
  onFilesSelectFromLibrary?: (files: FileType[]) => void;
};
const FileLibraryModal = ({
  onFilesSelectFromLibrary,
  isModalOpen,
  setIsModalOpen,
  files,
}: Props) => {
  const [showSelectExistingFiles, setShowSelectExistingFiles] = useState(true);

  return (
    <Modal
      opened={isModalOpen}
      close={() => {
        setIsModalOpen(false);
        // Reset the state to show the select existing files view
        setShowSelectExistingFiles(true);
      }}
    >
      <Box mt="20px">
        {showSelectExistingFiles && (
          <SelectExistingFile
            attachedFiles={files}
            setShowModal={setIsModalOpen}
            onFilesSelectFromLibrary={onFilesSelectFromLibrary}
          />
        )}
        <FilesUpload
          showInformationSection={false}
          showTitle={false}
          setModalOpen={setIsModalOpen}
          onFileSelect={() => {
            setShowSelectExistingFiles(false);
          }}
          afterUpload={(uploadedFiles) => {
            const newFiles: FileType[] = uploadedFiles.map((file) => ({
              id: file.id,
              name: file.file.name,
              size: file.file.size || 0,
              url: '',
              remote: false,
            }));

            // Filter out files that already exist to prevent duplicates
            const filesToAdd = newFiles.filter(
              (newFile) =>
                !files?.some((existingFile) => existingFile.id === newFile.id)
            );

            onFilesSelectFromLibrary?.(filesToAdd);
          }}
        />
      </Box>
    </Modal>
  );
};

export default FileLibraryModal;
