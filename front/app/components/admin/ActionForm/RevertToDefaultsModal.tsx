// Confirms giving up an action's own settings. Reverting deletes the
// permission, so every choice made on it — including which groups and
// demographic questions apply — goes with it, hence the extra step. The groups
// and questions themselves are platform-level and are left alone.

import React from 'react';

import { Box, Title, Button, Text } from '@citizenlab/cl2-component-library';

import Modal from 'components/UI/Modal';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

interface Props {
  opened: boolean;
  processing: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const RevertToDefaultsModal = ({
  opened,
  processing,
  onClose,
  onConfirm,
}: Props) => {
  const { formatMessage } = useIntl();

  return (
    <Modal
      opened={opened}
      close={onClose}
      ariaLabelledBy="revert-to-platform-defaults-title"
    >
      <Box display="flex" flexDirection="column" width="100%" p="20px">
        <Box mb="40px">
          <Title
            id="revert-to-platform-defaults-title"
            variant="h3"
            color="primary"
          >
            {formatMessage(messages.revertToPlatformDefaultsConfirmation)}
          </Title>
          <Text color="primary" fontSize="l">
            {formatMessage(messages.revertToPlatformDefaultsInfo)}
          </Text>
        </Box>
        <Box
          display="flex"
          flexDirection="row"
          width="100%"
          alignItems="center"
        >
          <Button
            buttonStyle="delete"
            width="auto"
            mr="20px"
            processing={processing}
            className="e2e-confirm-revert-to-platform-defaults"
            onClick={onConfirm}
          >
            {formatMessage(messages.revertToPlatformDefaultsConfirmButton)}
          </Button>
          <Button
            buttonStyle="secondary-outlined"
            width="auto"
            onClick={onClose}
          >
            {formatMessage(messages.revertToPlatformDefaultsCancelButton)}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default RevertToDefaultsModal;
