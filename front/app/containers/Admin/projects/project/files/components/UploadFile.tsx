import React, { useState } from 'react';

import { Button } from '@citizenlab/cl2-component-library';

import Modal from 'components/UI/Modal';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

const UploadFileButton = () => {
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
      <Modal opened={modalOpen} close={() => setModalOpen(false)}>
        TODO - Modal Content
      </Modal>
    </>
  );
};

export default UploadFileButton;
