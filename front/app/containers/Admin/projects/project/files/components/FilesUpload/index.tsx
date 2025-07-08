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
const MAX_FILES = 2;

const FilesUpload = ({ setModalOpen }: Props) => {
  const { formatMessage } = useIntl();
  const { projectId } = useParams() as { projectId: string };

  const [fileList, setFileList] = useState<FileWithMeta[]>([]);
  const [hasStartedUploading, setHasStartedUploading] = useState(false);
  const [showMaxNumberFilesMessage, setShowMaxNumberFilesMessage] =
    useState(false);

  // Create a React dropzone with the specified options
  const { getRootProps, getInputProps, open } = useDropzone({
    multiple: true,
    validator: () => null, // Allow all file types to be uploaded.
    onDrop: (acceptedFiles) => {
      // First check if user is trying to drop more than the maximum allowed files
      if (acceptedFiles.length > MAX_FILES) {
        // If so, show message to the user and do not proceed with the upload
        setShowMaxNumberFilesMessage(true);
        return;
      }
      // Reset the message if the number of files is within the limit
      setShowMaxNumberFilesMessage(false);

      const filesWithInitialStatus = acceptedFiles.map((file) => ({
        file,
        // Next, check if any file size exceeds the limit and set the status accordingly.
        // Otherwise, queue the file for upload by setting the status to 'queued'.
        status:
          file.size > MAX_FILE_SIZE ? 'too_large' : ('queued' as UploadStatus),
      }));

      setFileList(filesWithInitialStatus);
    },
  });

  const handleUpload = () => {
    setHasStartedUploading(true);
    // Update the status of all queued files to 'uploading',
    // which will trigger the upload process in the SelectedFile component.
    setFileList((prev) =>
      prev.map((file) =>
        file.status === 'queued' ? { ...file, status: 'uploading' } : file
      )
    );
  };

  const FINISHED_STATUSES: UploadStatus[] = ['uploaded', 'error', 'too_large'];

  const finishedUploading =
    hasStartedUploading &&
    fileList.every(({ status }) => FINISHED_STATUSES.includes(status));

  return (
    <>
      {fileList.length > 0 ? (
        <>
          <Title fontWeight="semi-bold" color="coolGrey700" variant="h3">
            {formatMessage(messages.confirmAndUploadFiles)}
          </Title>
          <Box maxHeight="300px" overflowY="auto" mt="20px">
            {fileList.map((item, index) => (
              <SelectedFile
                key={`${item.file.name}-${index}`}
                fileMeta={item}
                projectId={projectId}
                onStatusUpdate={(updatedStatus) => {
                  // Update the status of the file in the list
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
                  TODO: Add label once Product decides on copy.
                </Text>
              }
            />
          </Box>

          <FileUploadActions
            hasStartedUploading={hasStartedUploading}
            finishedUploading={finishedUploading}
            onUpload={handleUpload}
            onClose={() => {
              setFileList([]);
              setHasStartedUploading(false);
              setModalOpen(false);
            }}
          />
        </>
      ) : (
        <>
          <FileDropzone
            getRootProps={getRootProps}
            getInputProps={getInputProps}
            open={open}
          />
          {showMaxNumberFilesMessage && (
            <Text
              mt="8px"
              textAlign="center"
              m="0px"
              color="red500"
              fontSize="s"
            >
              {formatMessage(messages.maxFilesError, {
                maxFiles: MAX_FILES,
              })}
            </Text>
          )}
        </>
      )}
    </>
  );
};

export default FilesUpload;
