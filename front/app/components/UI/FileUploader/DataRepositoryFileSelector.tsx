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
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Track if the user is uploading new files, so we can hide the existing file selector
  const [isUploadingNewFiles, setIsUploadingNewFiles] = useState(false);

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
        }}
      >
        <Box mt="32px">
          {!isUploadingNewFiles && (
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
              // This hides the existing file selector, so we only see the relevant uploading section
              setIsUploadingNewFiles(true);
            }}
            afterUpload={(uploadedFiles) => {
              // Convert FileWithMeta files to the FileType format
              const newFiles: FileType[] = uploadedFiles.map((file) => ({
                id: file.id,
                name: file.file.name,
                size: file.file.size || 0,
                url: '',
                remote: false,
              }));

              // Send the files to the parent component
              onFileAddFromRepository?.(newFiles);
            }}
          />
        </Box>
      </Modal>
    </>
  );
};

export default DataRepositoryFileSelector;
