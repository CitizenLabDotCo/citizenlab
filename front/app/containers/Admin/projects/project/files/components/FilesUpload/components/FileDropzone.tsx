import React from 'react';

import {
  Box,
  Button,
  Success,
  Text,
  stylingConsts,
  colors,
} from '@citizenlab/cl2-component-library';

const FileDropzone = ({
  getRootProps,
  getInputProps,
  open,
  showSuccessMessage,
  formatMessage,
  messages,
}: {
  getRootProps: any;
  getInputProps: any;
  open: () => void;
  showSuccessMessage: boolean;
  formatMessage: (msg: any) => string;
  messages: Record<string, any>;
}) => {
  return (
    <>
      TODO: Add some additional bullet points here.
      <Box
        {...getRootProps()}
        p="20px"
        border={`1px dashed ${colors.coolGrey300}`}
        borderRadius={stylingConsts.borderRadius}
        display="flex"
        justifyContent="center"
        alignItems="center"
        flexDirection="column"
        mt="30px"
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
      {showSuccessMessage && (
        <Box mt="24px">
          <Success
            text={formatMessage(messages.filesUploadedSuccessfully)}
            showIcon={true}
            showBackground={true}
          />
        </Box>
      )}
    </>
  );
};

export default FileDropzone;
