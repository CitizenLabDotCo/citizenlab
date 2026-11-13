import React, { ReactNode } from 'react';

import { Box, Button, Select, Text } from '@citizenlab/cl2-component-library';
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
  variant?: 'default' | 'bo';
  opened: boolean;
  onClose: () => void;
  onFileAdd: (fileToAdd: UploadFile) => void;
  onFileAttach?: (fileToAttach: IFileData) => void;
  fileAttachments?: IFileAttachmentData[];
  maxSizeMb?: number;
  dataCy?: string;
  children?: ReactNode;
  isUploadingFile?: boolean;
}

const FileSelectModal = ({
  variant = 'default',
  opened,
  onClose,
  onFileAdd,
  onFileAttach,
  fileAttachments,
  maxSizeMb,
  dataCy,
  children,
  isUploadingFile = false,
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
    if (variant !== 'bo') onClose();
  };

  return (
    <Modal
      variant={variant}
      width={variant === 'bo' ? 400 : undefined}
      closeOnClickOutside={true}
      close={onClose}
      opened={opened}
      footer={
        variant === 'bo' ? (
          <Button
            buttonStyle="bo-primary"
            disabled={isUploadingFile}
            onClick={onClose}
          >
            {formatMessage(messages.done)}
          </Button>
        ) : undefined
      }
      header={formatMessage(
        variant === 'bo' ? messages.attachments : messages.selectFile
      )}
    >
      <Box mt="0px" p={variant === 'bo' ? '16px' : '24px'}>
        {filteredFileOptions.length > 0 && (
          <Box>
            <Select
              value={''} // Attached files disappear from the available options.
              onChange={(option) => {
                const fileToAttach = files?.data.find(
                  (file) => file.id === option.value
                );

                if (fileToAttach) {
                  onFileAttach?.(fileToAttach);
                  if (variant !== 'bo') onClose();
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

        {children}
        <FileInput
          variant={variant}
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
