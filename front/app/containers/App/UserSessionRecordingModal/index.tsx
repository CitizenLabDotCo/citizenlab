import React, { useState } from 'react';

import {
  Icon,
  colors,
  Text,
  Button,
  Title,
  Box,
} from '@citizenlab/cl2-component-library';
import { useIntl } from 'utils/cl-intl';
import messages from './messages';
import Modal from 'components/UI/Modal';

const UserSessionRecordingModal = () => {
  const [modalOpened, setModalOpened] = useState(true);
  const { formatMessage } = useIntl();

  const onClose = () => {
    setModalOpened(false);
  };

  const onAccept = () => {
    setModalOpened(false);
  };

  return (
    <Modal
      opened={modalOpened}
      close={() => {
        setModalOpened(false);
      }}
    >
      <Box p="24px">
        <Box display="flex" gap="16px" alignItems="center">
          <Icon
            name="alert-circle"
            fill={colors.green500}
            width="40px"
            height="40px"
          />
          <Title>{formatMessage(messages.modalTitle)}</Title>
        </Box>

        <Text fontSize="l">{formatMessage(messages.modalDescription1)}</Text>
        <Text fontSize="l">{formatMessage(messages.modalDescription2)}</Text>
        <Text fontSize="l">{formatMessage(messages.modalDescription3)}</Text>

        <Box display="flex" justifyContent="flex-end" gap="16px" mt="48px">
          <Button buttonStyle="secondary" onClick={onClose}>
            {formatMessage(messages.reject)}
          </Button>
          <Button buttonStyle="primary" onClick={onAccept}>
            {formatMessage(messages.accept)}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default UserSessionRecordingModal;
