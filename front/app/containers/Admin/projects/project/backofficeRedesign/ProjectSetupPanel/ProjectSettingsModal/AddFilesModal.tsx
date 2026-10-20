import React, { useRef, useState } from 'react';

import {
  Box,
  Button,
  CheckboxWithLabel,
  Text,
  colors,
  stylingConsts,
} from '@citizenlab/cl2-component-library';
import { useDropzone } from 'react-dropzone';

import { FileCategory } from 'api/files/types';
import useAddFile from 'api/files/useAddFile';
import useDeleteFile from 'api/files/useDeleteFile';
import useAuthUser from 'api/me/useAuthUser';

import { UploadStatus } from 'containers/Admin/projects/_shared/fileUploads/types';
import {
  MAX_FILES,
  MAX_FILE_SIZE,
  countFilesWithStatus,
  trackFileUpload,
} from 'containers/Admin/projects/_shared/fileUploads/utils';
import filesMessages from 'containers/Admin/projects/project/files/components/messages';

import Modal from 'components/UI/Modal';

import { useIntl } from 'utils/cl-intl';
import { getBase64FromFile, returnFileSize } from 'utils/fileUtils';

import messages from '../../messages';

import UploadingFileRow from './UploadingFileRow';

type Upload = {
  key: number;
  file: File;
  status: UploadStatus;
  category?: FileCategory;
  aiProcessingAllowed?: boolean;
  fileId?: string;
};

interface Props {
  projectId: string;
  opened: boolean;
  onClose: () => void;
}

const AddFilesModal = ({ projectId, opened, onClose }: Props) => {
  const { formatMessage } = useIntl();
  const { data: user } = useAuthUser();
  const { mutateAsync: addFile } = useAddFile();
  const { mutate: deleteFile } = useDeleteFile();

  const [uploads, setUploads] = useState<Upload[]>([]);
  const [tooManyFiles, setTooManyFiles] = useState(false);
  const [allowAiProcessing, setAllowAiProcessing] = useState(false);
  const nextKey = useRef(0);
  // State updates only land on the next render, so a quick double click on
  // Upload or Retry would otherwise start the same file twice.
  const inFlightKeys = useRef(new Set<number>());

  const updateUpload = (key: number, update: Partial<Upload>) =>
    setUploads((current) =>
      current.map((upload) =>
        upload.key === key ? { ...upload, ...update } : upload
      )
    );

  // Uploads keep running after the modal closes; the settings modal blocks
  // saving until they finish.
  const startUpload = async ({
    key,
    file,
    category,
    aiProcessingAllowed,
  }: Upload) => {
    if (inFlightKeys.current.has(key)) return;
    inFlightKeys.current.add(key);

    updateUpload(key, { status: 'uploading', aiProcessingAllowed });
    try {
      const content = await getBase64FromFile(file);
      const { data } = await addFile({
        content,
        project: projectId,
        name: file.name,
        category: category ?? 'other',
        ai_processing_allowed: aiProcessingAllowed,
      });
      updateUpload(key, { status: 'uploaded', fileId: data.id });
    } catch {
      updateUpload(key, { status: 'error' });
    } finally {
      inFlightKeys.current.delete(key);
    }
  };

  const { getRootProps, getInputProps, open } = useDropzone({
    multiple: true,
    noClick: true,
    // Allow all file types to be uploaded.
    validator: () => null,
    onDrop: (acceptedFiles) => {
      const tooMany = uploads.length + acceptedFiles.length > MAX_FILES;
      setTooManyFiles(tooMany);
      if (tooMany) return;

      setUploads((current) => [
        ...current,
        ...acceptedFiles.map(
          (file): Upload => ({
            key: nextKey.current++,
            file,
            status: file.size > MAX_FILE_SIZE ? 'too_large' : 'queued',
          })
        ),
      ]);
    },
  });

  const queued = uploads.filter(({ status }) => status === 'queued');
  const uploading = uploads.some(({ status }) => status === 'uploading');
  const totalSize = uploads.reduce((sum, { file }) => sum + file.size, 0);
  const finished = uploads.length > 0 && queued.length === 0 && !uploading;

  const handleUpload = () => {
    queued.forEach((upload) => {
      if (inFlightKeys.current.has(upload.key)) return;

      trackFileUpload({
        file: upload.file,
        projectId,
        user,
        aiProcessingAllowed: allowAiProcessing,
      });
      startUpload({ ...upload, aiProcessingAllowed: allowAiProcessing });
    });
  };

  const handleRemove = ({ key, fileId }: Upload) => {
    if (fileId) deleteFile(fileId);
    setUploads((current) => current.filter((upload) => upload.key !== key));
  };

  const handleClose = () => {
    setUploads([]);
    setTooManyFiles(false);
    setAllowAiProcessing(false);
    onClose();
  };

  return (
    <Modal
      variant="bo"
      opened={opened}
      close={handleClose}
      width={720}
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
              disabled={uploading}
              onClick={handleUpload}
            >
              {formatMessage(filesMessages.upload)}
            </Button>
          ) : (
            <Button
              buttonStyle="bo-primary"
              width="auto"
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
          py="40px"
          px="20px"
          border={`1px dashed ${colors.coolGrey300}`}
          borderRadius={stylingConsts.borderRadius}
        >
          <Text variant="boMicro" color="coolGrey500" m="0px">
            {formatMessage(messages.dropFilesHereOr)}
          </Text>
          <Button buttonStyle="bo-secondary" width="auto" onClick={open}>
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
          <Box mt="24px">
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
                    updateUpload(upload.key, { category })
                  }
                  onRetry={() => startUpload(upload)}
                  onRemove={() => handleRemove(upload)}
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
