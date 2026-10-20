import React from 'react';

import {
  Box,
  Button,
  CheckboxWithLabel,
  Text,
  bo,
  colors,
  stylingConsts,
} from '@citizenlab/cl2-component-library';
import { useDropzone } from 'react-dropzone';

import {
  MAX_FILES,
  countFilesWithStatus,
} from 'containers/Admin/projects/_shared/fileUploads/utils';
import messages from 'containers/Admin/projects/project/backofficeRedesign/messages';
import filesMessages from 'containers/Admin/projects/project/files/components/messages';

import Modal from 'components/UI/Modal';

import { useIntl } from 'utils/cl-intl';
import { returnFileSize } from 'utils/fileUtils';

import { FILE_MODAL_HEIGHT } from './FileRow';
import UploadingFileRow from './UploadingFileRow';
import useFileUploads from './useFileUploads';

interface Props {
  projectId: string;
  opened: boolean;
  onClose: () => void;
}

const AddFilesModal = ({ projectId, opened, onClose }: Props) => {
  const { formatMessage } = useIntl();
  const {
    uploads,
    queued,
    uploading,
    finished,
    tooManyFiles,
    allowAiProcessing,
    setAllowAiProcessing,
    addFiles,
    uploadQueued,
    retry,
    setCategory,
    remove,
    reset,
  } = useFileUploads(projectId);

  const { getRootProps, getInputProps, open } = useDropzone({
    multiple: true,
    noClick: true,
    // Allow all file types to be uploaded.
    validator: () => null,
    onDrop: addFiles,
  });

  const totalSize = uploads.reduce((sum, { file }) => sum + file.size, 0);

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal
      variant="bo"
      opened={opened}
      close={handleClose}
      width={560}
      height={uploads.length > 0 ? FILE_MODAL_HEIGHT : undefined}
      header={formatMessage(messages.addFiles)}
      footer={
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          gap="12px"
          width="100%"
        >
          <Text variant="boMicro" color="coolGrey500" m="0px">
            {finished &&
              formatMessage(filesMessages.uploadSummary, {
                numberOfFiles: countFilesWithStatus(uploads, 'uploaded'),
                numberOfErrors:
                  countFilesWithStatus(uploads, 'error') +
                  countFilesWithStatus(uploads, 'too_large'),
              })}
          </Text>
          {queued.length > 0 ? (
            <Button
              buttonStyle="bo-primary"
              width="auto"
              height={bo.buttonMedium.height}
              padding={bo.buttonMedium.padding}
              fontSize={bo.buttonMedium.fontSize}
              disabled={uploading}
              onClick={uploadQueued}
            >
              {formatMessage(filesMessages.upload)}
            </Button>
          ) : (
            <Button
              buttonStyle="bo-primary"
              width="auto"
              height={bo.buttonMedium.height}
              padding={bo.buttonMedium.padding}
              fontSize={bo.buttonMedium.fontSize}
              disabled={!finished}
              onClick={handleClose}
            >
              {formatMessage(filesMessages.done)}
            </Button>
          )}
        </Box>
      }
    >
      <Box p="24px">
        <Box
          {...getRootProps()}
          display="flex"
          alignItems="center"
          justifyContent="center"
          gap="12px"
          minHeight="88px"
          p="16px"
          border={`1px dashed ${colors.coolGrey300}`}
          borderRadius={stylingConsts.borderRadius}
        >
          <Text variant="boMicro" color="coolGrey500" m="0px">
            {formatMessage(messages.dropFilesHereOr)}
          </Text>
          <Button
            buttonStyle="bo-secondary"
            width="auto"
            height={bo.buttonMedium.height}
            padding={bo.buttonMedium.padding}
            fontSize={bo.buttonMedium.fontSize}
            onClick={open}
          >
            {formatMessage(filesMessages.chooseFiles)}
          </Button>
          <input {...getInputProps()} />
        </Box>
        <Text variant="boMicro" color="coolGrey500" mt="8px" mb="0px">
          {formatMessage(messages.supportedFileTypes)}
        </Text>
        {tooManyFiles && (
          <Text variant="boMicro" color="red600" mt="8px" mb="0px">
            {formatMessage(filesMessages.maxFilesError, {
              maxFiles: MAX_FILES,
            })}
          </Text>
        )}
        {uploads.length > 0 && (
          <Box mt="16px">
            <Text variant="boMicro" color="coolGrey500" mb="4px" mt="0px">
              {formatMessage(messages.filesCountWithSize, {
                count: uploads.length,
                size: returnFileSize(totalSize),
              })}
            </Text>
            <Box mx="-8px">
              {uploads.map((upload) => (
                <UploadingFileRow
                  key={upload.key}
                  file={upload.file}
                  status={upload.status}
                  category={upload.category}
                  onCategoryChange={(category) =>
                    setCategory(upload.key, category)
                  }
                  onRetry={() => retry(upload)}
                  onRemove={() => remove(upload)}
                />
              ))}
            </Box>
            <Box mt="16px">
              <CheckboxWithLabel
                size="20px"
                checked={allowAiProcessing}
                disabled={queued.length === 0 || uploading}
                onChange={(event) => setAllowAiProcessing(event.target.checked)}
                label={
                  <Text variant="boControl" fontSize="xs" m="0px">
                    {formatMessage(filesMessages.allowAiProcessing)}
                  </Text>
                }
              />
            </Box>
          </Box>
        )}
      </Box>
    </Modal>
  );
};

export default AddFilesModal;
