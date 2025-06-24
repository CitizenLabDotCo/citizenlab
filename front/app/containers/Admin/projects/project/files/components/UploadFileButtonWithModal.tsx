import React, { useState } from 'react';

import {
  Button,
  Box,
  Text,
  colors,
  stylingConsts,
} from '@citizenlab/cl2-component-library';
import { useDropzone } from 'react-dropzone';

import Modal from 'components/UI/Modal';

import { useIntl } from 'utils/cl-intl';

import FileExampleDescription from './FileExampleDescription';
import messages from './messages';

const UploadFileButtonWithModal = () => {
  const { formatMessage } = useIntl();
  const [modalOpen, setModalOpen] = useState(false);

  const { getRootProps, getInputProps, open } = useDropzone({
    noClick: false,
    noKeyboard: false,
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
      <Button
        buttonStyle="admin-dark"
        icon="plus-circle"
        iconSize="24px"
        text={formatMessage(messages.addFile)}
        onClick={() => setModalOpen(true)}
      />
      <Modal
        opened={modalOpen}
        close={() => setModalOpen(false)}
        width={'510px'}
        padding={'40px'}
      >
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
      </Modal>
    </>
  );
};

export default UploadFileButtonWithModal;
