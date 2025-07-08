// FilesUpload.tsx
import React, { useState } from 'react';

import {
  Box,
  CheckboxWithLabel,
  Text,
  Title,
} from '@citizenlab/cl2-component-library';
import { useDropzone } from 'react-dropzone';
import { useParams } from 'react-router-dom';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

import FileDropzone from './components/FileDropzone';
import FileUploadActions from './components/FileUploadActions';
import SelectedFile from './components/SelectedFile';
import { FileWithMeta, UploadStatus } from './types';

type Props = {
  setModalOpen: (open: boolean) => void;
};

const MAX_FILE_SIZE = 50 * 1024 * 1024;
const MAX_FILES = 35;

const FilesUpload = ({ setModalOpen }: Props) => {
  const { formatMessage } = useIntl();
  const { projectId } = useParams() as { projectId: string };
  const [fileList, setFileList] = useState<FileWithMeta[]>([]);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [hasStartedUploading, setHasStartedUploading] = useState(false);

  const { getRootProps, getInputProps, open } = useDropzone({
    multiple: true,
    validator: () => null,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > MAX_FILES) {
        setFileList([]);
        setShowSuccessMessage(false);
        return;
      }

      const filesWithInitialStatus = acceptedFiles.map((file) => ({
        file,
        // Check if file size exceeds the limit first
        status:
          file.size > MAX_FILE_SIZE ? 'too_large' : ('queued' as UploadStatus),
      }));

      setFileList(filesWithInitialStatus);
      setShowSuccessMessage(false);
    },
  });

  const handleUpload = () => {
    setHasStartedUploading(true);
    setFileList((prev) =>
      prev.map((file) =>
        file.status === 'queued' ? { ...file, status: 'uploading' } : file
      )
    );
  };

  const allDone =
    hasStartedUploading &&
    fileList.every((file) =>
      ['uploaded', 'error', 'too_large'].includes(file.status)
    );

  return (
    <>
      {fileList.length > 0 ? (
        <>
          <Title fontWeight="semi-bold" color="coolGrey700" variant="h3">
            {formatMessage(messages.confirmAndUploadFiles)}
          </Title>
          <Box maxHeight="300px" overflowY="auto" mt="20px">
            {fileList.map((item) => (
              <SelectedFile
                key={`${item.file.name}-${item.file.size}`}
                fileMeta={item}
                projectId={projectId}
                onStatusUpdate={(updatedStatus) => {
                  setFileList((prev) =>
                    prev.map((file) =>
                      file.file === item.file
                        ? { ...file, ...updatedStatus }
                        : file
                    )
                  );
                }}
              />
            ))}
          </Box>

          <Box mt="20px">
            <CheckboxWithLabel
              checked={false}
              onChange={() => {}} // TODO: Implement onChange logic once BE implemented.
              label={
                <Text ml="8px" m="0px" color="coolGrey600" fontSize="s">
                  TODO: Add label once BE is implemented.
                </Text>
              }
            />
          </Box>

          <FileUploadActions
            hasStartedUploading={hasStartedUploading}
            allDone={allDone}
            onUpload={handleUpload}
            onClose={() => {
              setFileList([]);
              setHasStartedUploading(false);
              setShowSuccessMessage(false);
              setModalOpen(false);
            }}
          />
        </>
      ) : (
        <FileDropzone
          getRootProps={getRootProps}
          getInputProps={getInputProps}
          open={open}
          showSuccessMessage={showSuccessMessage}
          formatMessage={formatMessage}
          messages={messages}
        />
      )}
    </>
  );
};

export default FilesUpload;
