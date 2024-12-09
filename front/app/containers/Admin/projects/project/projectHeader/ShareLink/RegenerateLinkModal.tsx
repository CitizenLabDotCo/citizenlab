import React from 'react';

import { Box, Button, Text } from '@citizenlab/cl2-component-library';

import Modal from 'components/UI/Modal';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

const RegenerateLinkModal = ({
  isOpened,
  isRefreshLoading,
  onRefresh,
  onClose,
}: {
  isOpened: boolean;
  isRefreshLoading: boolean;
  onRefresh: () => void;
  onClose: () => void;
}) => {
  const { formatMessage } = useIntl();
  return (
    <Modal
      opened={isOpened}
      close={onClose}
      width="350px"
      header={formatMessage(messages.regenenrateLinkModalTitle)}
      closeOnClickOutside
    >
      <Box padding="20px">
        <Text>{formatMessage(messages.regenenrateLinkModalDescription)}</Text>
        <Box display="flex" gap="8px" marginTop="20px" flexDirection="column">
          <Button
            id="e2e-refresh-link-accept"
            buttonStyle="delete"
            icon="delete"
            onClick={onRefresh}
            processing={isRefreshLoading}
          >
            {formatMessage(messages.regenerateYes)}
          </Button>
          <Button buttonStyle="secondary-outlined" onClick={onClose}>
            {formatMessage(messages.regenerateNo)}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default RegenerateLinkModal;
