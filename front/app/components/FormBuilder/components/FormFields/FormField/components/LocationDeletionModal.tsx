import React from 'react';

import { Button, Box, Title, Text } from '@citizenlab/cl2-component-library';

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
      header={
        <Title color="primary" variant="h4" m="0px">
          {formatMessage(messages.confirmDeletion)}
        </Title>
      }
    >
      <Box p="20px">
        <Box mb="20px">
          <Text m="0px" textAlign="center">
            {formatMessage(messages.deleteLocationFieldExplanation1)}
          </Text>
          <Text fontWeight="bold" textAlign="center">
            {formatMessage(messages.deleteLocationFieldExplanation2)}
          </Text>
        </Box>
        <Box display="flex" justifyContent="center" gap="8px">
          <Button buttonStyle="secondary" onClick={() => setModalOpen(false)}>
            {formatMessage(messages.cancel)}
          </Button>
          <Button
            onClick={() => {
              onDelete(index);
              setModalOpen(false);
            }}
            buttonStyle="admin-dark"
          >
            {formatMessage(messages.delete)}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default LocationDeletionModal;
