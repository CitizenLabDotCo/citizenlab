import React from 'react';

import { Box, Button, Select, Text } from '@citizenlab/cl2-component-library';
import { useParams } from 'utils/router';
import { UploadFile } from 'typings';

import { IFileAttachmentData } from 'api/file_attachments/types';
import { IFileData } from 'api/files/types';
import useFiles from 'api/files/useFiles';

import Modal from 'components/UI/Modal';

import { useIntl } from 'utils/cl-intl';

import FileInput from '../../FileUploader/FileInput';

import messages from './messages';

type Props = {
  onFileAdd: (fileToAdd: UploadFile) => void;
  onFileAttach?: (fileToAttach: IFileData) => void;
  fileAttachments?: IFileAttachmentData[];
  maxSizeMb?: number;
  dataCy?: string;
  isDisabled?: boolean;
};

const FileSelectOrUploadModal = ({
  onFileAdd,
  onFileAttach,
  maxSizeMb,
  fileAttachments,
  isDisabled,
  dataCy,
}: Props) => {
  const { formatMessage } = useIntl();
  const [modalOpen, setModalOpen] = React.useState(false);

  const { projectId } = useParams({ strict: false });

  const { data: files } = useFiles({
    project: projectId ? [projectId] : [],
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
        id={'e2e-open-file-upload-modal-button'}
        buttonStyle="secondary"
        icon="file-add"
        disabled={isDisabled}
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
          {filteredFileOptions.length > 0 && (
            <Box>
              <Select
                value={''} // Since onChange we close the modal, we don't need to worry about setting this value.
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
            id={'e2e-file-upload-input'}
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
