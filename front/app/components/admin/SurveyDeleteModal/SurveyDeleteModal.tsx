import React from 'react';

import { Box, Title, Button, Text } from '@citizenlab/cl2-component-library';

import Modal from 'components/UI/Modal';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

type Props = {
  showDeleteModal: boolean;
  closeDeleteModal: () => void;
  deleteResults: () => void;
};
const DeleteModal = ({
  showDeleteModal,
  closeDeleteModal,
  deleteResults,
}: Props) => {
  const { formatMessage } = useIntl();
  return (
    <Modal opened={showDeleteModal} close={closeDeleteModal}>
      <Box display="flex" flexDirection="column" width="100%" p="20px">
        <Box mb="40px">
          <Title variant="h3" color="primary">
            {formatMessage(messages.deleteResultsConfirmationQuestion)}
          </Title>
          <Text color="primary" fontSize="l">
            {formatMessage(messages.deleteResultsInfo)}
          </Text>
        </Box>
        <Box
          display="flex"
          flexDirection="row"
          width="100%"
          alignItems="center"
        >
          <Button
            icon="delete"
            data-cy="e2e-confirm-delete-survey-results"
            buttonStyle="delete"
            width="auto"
            mr="20px"
            onClick={deleteResults}
          >
            {formatMessage(messages.confirmDeleteButtonText)}
          </Button>
          <Button
            buttonStyle="secondary-outlined"
            width="auto"
            onClick={closeDeleteModal}
          >
            {formatMessage(messages.cancelDeleteButtonText)}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default DeleteModal;
