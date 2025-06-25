import React from 'react';

import {
  Box,
  colors,
  Button,
  stylingConsts,
  Text,
} from '@citizenlab/cl2-component-library';
import { useDropzone } from 'react-dropzone';

import useAddFile from 'api/files/useAddFile';

import { useIntl } from 'utils/cl-intl';

import FileExampleDescription from './FileExampleDescription';
import messages from './messages';

const FileUploadWithDropzone = () => {
  const { formatMessage } = useIntl();
  const { mutate: addFile } = useAddFile();

  const { getRootProps, getInputProps, open } = useDropzone({
    noClick: false,
    multiple: true,
    validator: () => null, // Accept all file types.
    onDrop: (_files) => {
      // ToDo: Handle file uploads once BE is in place.
    },
    onDropRejected: (_fileRejections) => {
      // ToDo: Handle file rejections, e.g., show error messages.
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
        />
        <input {...getInputProps()} />
      </Box>
    </>
  );
};

export default FileUploadWithDropzone;
