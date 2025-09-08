import React from 'react';

import { Box, Button, Select, Text } from '@citizenlab/cl2-component-library';
import { useParams } from 'react-router-dom';
import { UploadFile } from 'typings';

import { IFileAttachmentData } from 'api/file_attachments/types';
import { IFileData } from 'api/files/types';
import useFiles from 'api/files/useFiles';

import useFeatureFlag from 'hooks/useFeatureFlag';

import Modal from 'components/UI/Modal';

import { useIntl } from 'utils/cl-intl';

import FileInput from '../../FileUploader/FileInput';

import messages from './messages';

type Props = {
  id: string;
  onFileAdd: (fileToAdd: UploadFile) => void;
  onFileAttach?: (fileToAttach: IFileData) => void;
  fileAttachments?: IFileAttachmentData[];
  maxSizeMb?: number;
  dataCy?: string;
};

const FileSelectOrUploadModal = ({
  id,
  onFileAdd,
  onFileAttach,
  maxSizeMb,
  fileAttachments,
  dataCy,
}: Props) => {
  const { formatMessage } = useIntl();
  const [modalOpen, setModalOpen] = React.useState(false);
  const isDataRepositoryEnabled = useFeatureFlag({
    name: 'data_repository',
  });

  const { projectId } = useParams();

  const { data: files } = useFiles({
    project: [projectId || ''],
    enabled: !!projectId,
  });

  // Generate options for the file select dropdown
  const fileOptions = files
    ? files.data.map((file) => ({
        value: file.id,
        label: file.attributes.name,
      }))
    : [];

  // Filter out already attached files
  const filteredFileOptions = fileAttachments
    ? fileOptions.filter(
        (option) =>
          !fileAttachments.find(
            (attachment) =>
              attachment.relationships.file.data.id === option.value
          )
      )
    : fileOptions;

  const handleFileOnAdd = (fileToAdd: UploadFile) => {
    onFileAdd(fileToAdd);
    setModalOpen(false);
  };

  return (
    <>
      <Button
        onClick={() => setModalOpen(true)}
        buttonStyle="secondary"
        icon="file-add"
      >
        {formatMessage(messages.addFile)}
      </Button>
      <Modal
        closeOnClickOutside={true}
        close={() => setModalOpen(false)}
        opened={modalOpen}
        header={formatMessage(messages.selectFile)}
      >
        <Box mt="0px" p="24px">
          {isDataRepositoryEnabled && (
            <Box>
              <Select
                value={''}
                onChange={(option) => {
                  // Get the selected file from the files list
                  const selectedFile = files?.data.find(
                    (file) => file.id === option.value
                  );

                  // Add the selected file to the attachments using the callback provided.
                  if (selectedFile) {
                    const fileToAttach = files?.data.find(
                      (file) => file.id === option.value
                    );

                    fileToAttach && onFileAttach?.(fileToAttach);
                    setModalOpen(false);
                  }
                }}
                placeholder={formatMessage(messages.selectExistingFile)}
                options={filteredFileOptions}
              />
              <Text m="0px" my="8px" textAlign="center">
                {formatMessage(messages.or)}
              </Text>
            </Box>
          )}

          <FileInput
            onAdd={handleFileOnAdd}
            id={id}
            multiple={false}
            maxSizeMb={maxSizeMb}
            dataCy={dataCy}
          />
        </Box>
      </Modal>
    </>
  );
};

export default FileSelectOrUploadModal;
