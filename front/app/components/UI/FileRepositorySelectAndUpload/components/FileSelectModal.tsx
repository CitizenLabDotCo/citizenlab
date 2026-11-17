import React, { ReactNode } from 'react';

import { Box, Select, Text } from '@citizenlab/cl2-component-library';
import { UploadFile } from 'typings';

import { ListBoxOption } from 'design-system/ListBox';
import DesignSystemModal from 'design-system/Modal';
import DesignSystemSelect from 'design-system/Select';

import { IFileAttachmentData } from 'api/file_attachments/types';
import { IFileData } from 'api/files/types';
import useFiles from 'api/files/useFiles';

import Modal from 'components/UI/Modal';

import { useIntl } from 'utils/cl-intl';
import { useParams } from 'utils/router';

import FileInput from '../../FileUploader/FileInput';

import styles from './FileSelectModal.module.css';
import messages from './messages';
import 'design-system/tokens.css';

interface Props {
  /** The panel keeps the modal open to show the attached files (children). */
  variant?: 'default' | 'panel';
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

  const closeUnlessUploading = () => {
    if (!isUploadingFile) onClose();
  };

  const isPanel = variant === 'panel';

  const handleFileOnAdd = (fileToAdd: UploadFile) => {
    onFileAdd(fileToAdd);
    if (!isPanel) onClose();
  };

  const attachExistingFile = (fileId: string) => {
    const fileToAttach = files?.data.find((file) => file.id === fileId);

    if (fileToAttach) {
      onFileAttach?.(fileToAttach);
      if (!isPanel) onClose();
    }
  };

  if (isPanel) {
    return (
      <DesignSystemModal
        isOpen={opened}
        onOpenChange={(isOpen) => {
          if (!isOpen) closeUnlessUploading();
        }}
        isDismissable={!isUploadingFile}
        title={formatMessage(messages.attachments)}
        size={440}
        primaryAction={{
          label: formatMessage(messages.done),
          isDisabled: isUploadingFile,
          onPress: onClose,
        }}
      >
        <div className={styles.body}>
          {filteredFileOptions.length > 0 && (
            <>
              <DesignSystemSelect
                aria-label={formatMessage(messages.selectExistingFile)}
                placeholder={formatMessage(messages.selectExistingFile)}
                size={32}
                // Attached files disappear from the available options.
                value={null}
                onChange={(key) => {
                  if (typeof key === 'string') attachExistingFile(key);
                }}
              >
                {filteredFileOptions.map(({ value, label }) => (
                  <ListBoxOption key={value} id={value}>
                    {label}
                  </ListBoxOption>
                ))}
              </DesignSystemSelect>
              <p className={styles.or}>{formatMessage(messages.or)}</p>
            </>
          )}
          {children}
          <FileInput
            variant="panel"
            onAdd={handleFileOnAdd}
            id={'e2e-file-upload-input'}
            multiple={false}
            maxSizeMb={maxSizeMb}
            dataCy={dataCy}
          />
        </div>
      </DesignSystemModal>
    );
  }

  return (
    <Modal
      closeOnClickOutside={true}
      close={closeUnlessUploading}
      opened={opened}
      header={formatMessage(messages.selectFile)}
    >
      <Box mt="0px" p="24px">
        {filteredFileOptions.length > 0 && (
          <Box>
            <Select
              value={''} // Since onChange we close the modal, we don't need to worry about setting this value.
              onChange={(option) => attachExistingFile(option.value)}
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
