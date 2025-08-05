import React, { useState } from 'react';

import { Box, Button } from '@citizenlab/cl2-component-library';

import FilesUpload from 'containers/Admin/projects/project/files/components/FilesUpload';

import { useIntl } from 'utils/cl-intl';

import Modal from '../Modal';

import SelectExistingFile from './components/SelectExistingFile';
import { FileType } from './FileDisplay';
import messages from './messages';

type Props = {
  files?: FileType[];
  onFileAddFromRepository?: (files: FileType[]) => void;
};
const DataRepositoryFileSelector = ({
  onFileAddFromRepository,
  files,
}: Props) => {
  const { formatMessage } = useIntl();
  const [showSelectExistingFiles, setShowSelectExistingFiles] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Button
        mt="12px"
        icon="file-add"
        buttonStyle="secondary-outlined"
        onClick={() => setIsModalOpen(true)}
      >
        {formatMessage(messages.clickToSelectAFile)}
      </Button>
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
              onFileAddFromRepository={onFileAddFromRepository}
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

              onFileAddFromRepository?.(filesToAdd);
            }}
          />
        </Box>
      </Modal>
    </>
  );
};

export default DataRepositoryFileSelector;
