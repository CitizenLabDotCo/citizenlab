import React from 'react';

import { Button, Box, Text } from '@citizenlab/cl2-component-library';

import Modal from 'components/UI/Modal';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

type Props = {
  opened: boolean;
  setModalOpen: (open: boolean) => void;
  onDelete: (fieldIndex: number) => void;
  index: number;
  returnFocusRef?: React.RefObject<HTMLElement> | undefined;
};

const LocationDeletionModal = ({
  opened,
  setModalOpen,
  returnFocusRef,
  onDelete,
  index,
}: Props) => {
  const { formatMessage } = useIntl();
  return (
    <Modal
      opened={opened}
      close={() => setModalOpen(false)}
      returnFocusRef={returnFocusRef}
      width={520}
      header={formatMessage(messages.confirmDeletion)}
      footer={
        <Box display="flex" justifyContent="flex-end" gap="8px" width="100%">
          <Button
            buttonStyle="secondary-outlined"
            onClick={() => setModalOpen(false)}
          >
            {formatMessage(messages.cancel)}
          </Button>
          <Button
            data-cy="e2e-confirm-delete-location-field"
            buttonStyle="delete"
            onClick={() => {
              onDelete(index);
              setModalOpen(false);
            }}
          >
            {formatMessage(messages.delete)}
          </Button>
        </Box>
      }
    >
      <Box p="24px">
        <Text m="0" mb="12px">
          {formatMessage(messages.deleteLocationFieldExplanation1)}
        </Text>
        <Text m="0" fontWeight="bold">
          {formatMessage(messages.deleteLocationFieldExplanation2)}
        </Text>
      </Box>
    </Modal>
  );
};

export default LocationDeletionModal;
