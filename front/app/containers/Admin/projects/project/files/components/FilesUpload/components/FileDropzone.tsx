import React from 'react';

import {
  Box,
  Button,
  Text,
  stylingConsts,
  colors,
} from '@citizenlab/cl2-component-library';
import { useDropzone } from 'react-dropzone';

import { useIntl } from 'utils/cl-intl';

import messages from '../../messages';

type Props = {
  getRootProps: ReturnType<typeof useDropzone>['getRootProps'];
  getInputProps: ReturnType<typeof useDropzone>['getInputProps'];
  open: () => void;
};

const FileDropzone = ({ getRootProps, getInputProps, open }: Props) => {
  const { formatMessage } = useIntl();

  // TODO: Add some additional bullet points before the dropzone once Product decides.

  return (
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
  );
};

export default FileDropzone;
