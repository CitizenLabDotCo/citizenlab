import React, { useState } from 'react';

import {
  Box,
  colors,
  Button,
  stylingConsts,
  Text,
  Success,
} from '@citizenlab/cl2-component-library';
import { useDropzone } from 'react-dropzone';
import { CLErrors } from 'typings';

import useAddFile from 'api/files/useAddFile';

import Error from 'components/UI/Error';

import { useIntl } from 'utils/cl-intl';
import { getBase64FromFile } from 'utils/fileUtils';

import FileExampleDescription from './FileExampleDescription';
import messages from './messages';

type FilesValidationError =
  | 'maxFilesExceeded'
  | 'oversizedFiles'
  | 'filesRejected';

const FileUploadWithDropzone = () => {
  const { formatMessage } = useIntl();
  const { mutate: addFile, isLoading } = useAddFile();

  const [apiErrors, setApiErrors] = useState<CLErrors | null>(null);
  const [filesValidationError, setFilesValidationError] =
    useState<FilesValidationError | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const { getRootProps, getInputProps, open } = useDropzone({
    multiple: true, // Allow multiple files to be selected.
    validator: () => null, // Null to accept all file types.
    onDrop: (files) => {
      // Reset error & success state
      setApiErrors(null);
      setShowSuccessMessage(true);
      setFilesValidationError(null);

      // Check that no more than 35 files are selected.
      if (files.length > 35) {
        setFilesValidationError('maxFilesExceeded');
        setShowSuccessMessage(false);
        return;
      }

      // Check that no file selected is larger than 50MB
      const maxFileSize = 50 * 1024 * 1024; // 50MB to bytes
      const oversizedFiles = files.filter((file) => file.size > maxFileSize);

      // If there are oversized files, set the error state and return.
      if (oversizedFiles.length > 0) {
        setFilesValidationError('oversizedFiles');
        setShowSuccessMessage(false);
        return;
      }

      // If no oversized files, try to upload each file.
      files.forEach(async (file) => {
        // Create a FileReader to read the file.
        const reader = new FileReader();
        // Get the base64 content of the file.
        const fileContent = await getBase64FromFile(file);

        // Upload the file
        addFile(
          {
            content: fileContent,
            name: file.name,
          },
          {
            onError: (error) => {
              setShowSuccessMessage(false);
              setApiErrors(error);
              return;
            },
          }
        );

        reader.onerror = (_error) => {
          // ToDo: Handle file reading errors.
        };
      });
    },
    onDropRejected: () => {
      setShowSuccessMessage(false);
      setFilesValidationError('filesRejected');
    },
  });

  return (
    <>
      <Box mb="30px">
        <FileExampleDescription
          iconName={'audio'}
          fileTypeMessage={messages.audioFileDescription}
          fileExtensionMessage={messages.audioFileExtensionDescription}
        />
        <FileExampleDescription
          iconName={'reports'}
          fileTypeMessage={messages.textFileDescription}
          fileExtensionMessage={messages.textFileExtensionDescription}
        />
        <FileExampleDescription
          iconName={'image'}
          fileTypeMessage={messages.imageFileDescription}
          fileExtensionMessage={messages.imageFileExtensionDescription}
        />
      </Box>
      <Box
        {...getRootProps()}
        p="20px"
        border={`1px dashed ${colors.coolGrey300}`}
        borderRadius={stylingConsts.borderRadius}
        display="flex"
        justifyContent="center"
        alignItems="center"
        flexDirection="column"
      >
        <Text m="0px" color="coolGrey600">
          {formatMessage(messages.dragAndDropFiles)}
        </Text>
        <Button
          buttonStyle="admin-dark"
          text={formatMessage(messages.chooseFiles)}
          mt="10px"
          onClick={open}
          disabled={isLoading}
        />
        <input {...getInputProps()} disabled={isLoading} />
      </Box>
      {showSuccessMessage && (
        <Box mt="24px">
          <Success
            text={formatMessage(messages.filesUploadedSuccessfully)}
            showIcon={true}
            showBackground={true}
          />
        </Box>
      )}
      {filesValidationError === 'maxFilesExceeded' && (
        <Box mt="10px">
          <Error
            text={formatMessage(messages.maxFilesError, {
              maxFiles: 2,
            })}
          />
        </Box>
      )}
      {filesValidationError === 'oversizedFiles' && (
        <Box mt="10px">
          <Error
            text={formatMessage(messages.fileSizeError, {
              maxSizeMb: 50,
            })}
          />
        </Box>
      )}
      {filesValidationError === 'filesRejected' && (
        <Box mt="10px">
          <Error text={formatMessage(messages.filesRejected)} />
        </Box>
      )}
      {apiErrors && <Error apiErrors={apiErrors.errors} />}
    </>
  );
};

export default FileUploadWithDropzone;
