import React from 'react';

import { Box, Select, Text } from '@citizenlab/cl2-component-library';
import { UploadFile } from 'typings';

import { IFileAttachmentData } from 'api/file_attachments/types';
import { IFileData } from 'api/files/types';
import useFiles from 'api/files/useFiles';

import Modal from 'components/UI/Modal';

import { useIntl } from 'utils/cl-intl';
import { useParams } from 'utils/router';

import FileInput from '../../FileUploader/FileInput';

import messages from './messages';

interface Props {
  opened: boolean;
  onClose: () => void;
  onFileAdd: (fileToAdd: UploadFile) => void;
  onFileAttach?: (fileToAttach: IFileData) => void;
  fileAttachments?: IFileAttachmentData[];
  maxSizeMb?: number;
  dataCy?: string;
}

const FileSelectModal = ({
  opened,
  onClose,
  onFileAdd,
  onFileAttach,
  fileAttachments,
  maxSizeMb,
  dataCy,
}: Props) => {
  const { formatMessage } = useIntl();
  const { projectId } = useParams({ strict: false });

  const { data: files } = useFiles({
    project: projectId ? [projectId] : [],
  });

  const fileOptions = files
    ? files.data.map((file) => ({
        value: file.id,
        label: file.attributes.name,
      }))
    : [];

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
    onClose();
  };

  return (
    <Modal
      closeOnClickOutside={true}
      close={onClose}
      opened={opened}
      header={formatMessage(messages.selectFile)}
    >
      <Box mt="0px" p="24px">
        {filteredFileOptions.length > 0 && (
          <Box>
            <Select
              value={''} // Since onChange we close the modal, we don't need to worry about setting this value.
              onChange={(option) => {
                const fileToAttach = files?.data.find(
                  (file) => file.id === option.value
                );

                if (fileToAttach) {
                  onFileAttach?.(fileToAttach);
                  onClose();
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
  );
};

export default FileSelectModal;
