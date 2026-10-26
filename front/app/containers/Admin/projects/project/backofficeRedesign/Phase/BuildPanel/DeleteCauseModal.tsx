import React from 'react';

import { Box, Button, Text } from '@citizenlab/cl2-component-library';

import Modal from 'components/UI/Modal';

import { useIntl } from 'utils/cl-intl';

import messages from '../../messages';

interface Props {
  onConfirm: () => void;
  onClose: () => void;
}

const DeleteCauseModal = ({ onConfirm, onClose }: Props) => {
  const { formatMessage } = useIntl();

  return (
    <Modal
      opened
      close={onClose}
      width={480}
      variant="bo"
      header={formatMessage(messages.deleteCauseTitle)}
      footer={
        <Box display="flex" justifyContent="flex-end" gap="8px" width="100%">
          <Button buttonStyle="bo-text" onClick={onClose}>
            {formatMessage(messages.causeCancel)}
          </Button>
          <Button
            buttonStyle="bo-primary"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {formatMessage(messages.deleteCause)}
          </Button>
        </Box>
      }
    >
      <Box p="24px">
        <Text variant="boHelper" m="0">
          {formatMessage(messages.deleteCauseDescription)}
        </Text>
      </Box>
    </Modal>
  );
};

export default DeleteCauseModal;
