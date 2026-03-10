import React, { useState } from 'react';

import { Button } from '@citizenlab/cl2-component-library';

import Modal from 'components/UI/Modal';

import { ScreenReaderOnly } from 'utils/a11y';
import { useIntl } from 'utils/cl-intl';

import FilesUpload from './FilesUpload';
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
        text={formatMessage(messages.addFiles)}
        onClick={() => setModalOpen(true)}
      />
      <Modal
        opened={modalOpen}
        close={() => setModalOpen(false)}
        padding={'40px'}
        ariaLabelledBy="upload-files-modal-title"
      >
        <ScreenReaderOnly id="upload-files-modal-title">
          {formatMessage(messages.addFiles)}
        </ScreenReaderOnly>
        <FilesUpload setModalOpen={setModalOpen} />
      </Modal>
    </>
  );
};

export default UploadFileButtonWithModal;
