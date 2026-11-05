import React from 'react';

import { Box, Button, Text } from '@citizenlab/cl2-component-library';

import Modal from 'components/UI/Modal';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

interface Props {
  opened: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const VotingMethodChangeModal = ({ opened, onClose, onConfirm }: Props) => {
  const { formatMessage } = useIntl();

  return (
    <Modal
      opened={opened}
      close={onClose}
      width={520}
      header={formatMessage(messages.changeVotingMethodTitle)}
      footer={
        <Box display="flex" justifyContent="flex-end" gap="8px" width="100%">
          <Button buttonStyle="secondary-outlined" onClick={onClose}>
            {formatMessage(messages.changeVotingMethodCancel)}
          </Button>
          <Button buttonStyle="delete" onClick={onConfirm}>
            {formatMessage(messages.changeVotingMethodConfirm)}
          </Button>
        </Box>
      }
    >
      <Box p="24px">
        <Text m="0">{formatMessage(messages.changeVotingMethodWarning)}</Text>
      </Box>
    </Modal>
  );
};

export default VotingMethodChangeModal;
