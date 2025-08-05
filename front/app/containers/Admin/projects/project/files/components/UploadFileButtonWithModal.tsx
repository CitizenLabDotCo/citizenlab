import React, { useState } from 'react';

import { Button } from '@citizenlab/cl2-component-library';

import Modal from 'components/UI/Modal';

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
      >
        <FilesUpload setModalOpen={setModalOpen} />
      </Modal>
    </>
  );
};

export default UploadFileButtonWithModal;
