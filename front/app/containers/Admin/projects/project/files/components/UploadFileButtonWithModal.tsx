import React, { useState } from 'react';

import { Button, Box } from '@citizenlab/cl2-component-library';
import Dropzone from 'react-dropzone';

import FileUploader from 'components/UI/FileUploader';
import Modal from 'components/UI/Modal';

import { useIntl } from 'utils/cl-intl';

import FileExampleDescription from './FileExampleDescription';
import messages from './messages';

const UploadFileButtonWithModal = () => {
  const { formatMessage } = useIntl();

  const [modalOpen, setModalOpen] = useState(false);

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
            iconName={'search'}
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
        <Box>
          <Dropzone
            accept={{
              'image/*': ['.jpg', '.jpeg', '.png', '.gif'],
              'text/*': ['.txt', '.csv', '.doc', '.docx', '.pdf'],
              'audio/*': ['.mp3', '.wav', '.ogg'],
            }}
            maxSize={50}
            disabled={false}
            onDrop={(file) => {
              console.log('File dropped!', file);
            }}
            onDropRejected={(test) => {
              console.log('File drop rejected', test);
            }}
          >
            {({ getInputProps }) => {
              return (
                <Box p="50px">
                  DROPZONE FOR FILES HERE
                  <input {...getInputProps()} />
                </Box>
              );
            }}
          </Dropzone>
        </Box>

        <FileUploader
          id="e2e-file-uploader"
          onFileAdd={() => {}}
          onFileRemove={() => {}}
          files={null}
          apiErrors={[]}
          onFileReorder={() => {}}
          enableDragAndDrop
          multiple
        />
      </Modal>
    </>
  );
};

export default UploadFileButtonWithModal;
