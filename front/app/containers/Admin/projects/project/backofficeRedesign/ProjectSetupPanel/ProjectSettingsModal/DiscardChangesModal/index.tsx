import React from 'react';

import { Box, Button, Text } from '@citizenlab/cl2-component-library';

import messages from 'containers/Admin/projects/project/backofficeRedesign/messages';

import Modal from 'components/UI/Modal';

import { useIntl } from 'utils/cl-intl';

interface Props {
  opened: boolean;
  onKeepEditing: () => void;
  onDiscard: () => void;
}

const DiscardChangesModal = ({ opened, onKeepEditing, onDiscard }: Props) => {
  const { formatMessage } = useIntl();

  return (
    <Modal
      variant="bo"
      opened={opened}
      close={onKeepEditing}
      width={540}
      header={formatMessage(messages.unsavedChangesTitle)}
      footer={
        <Box display="flex" justifyContent="flex-end" gap="8px" w="100%">
          <Button
            buttonStyle="bo-secondary"
            width="auto"
            onClick={onKeepEditing}
          >
            {formatMessage(messages.unsavedChangesCancel)}
          </Button>
          <Button buttonStyle="bo-delete" width="auto" onClick={onDiscard}>
            {formatMessage(messages.discardChanges)}
          </Button>
        </Box>
      }
    >
      <Box p="24px">
        <Text variant="boHelper" m="0px">
          {formatMessage(messages.unsavedChangesDescription2)}
        </Text>
      </Box>
    </Modal>
  );
};

export default DiscardChangesModal;
