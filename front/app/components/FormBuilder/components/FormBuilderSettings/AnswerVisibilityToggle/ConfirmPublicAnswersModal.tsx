import React from 'react';

import { Box, Button, Text, Title } from '@citizenlab/cl2-component-library';

import Modal from 'components/UI/Modal';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

type Props = {
  opened: boolean;
  submissionCount: number;
  onCancel: () => void;
  onConfirm: () => void;
};

const ConfirmPublicAnswersModal = ({
  opened,
  submissionCount,
  onCancel,
  onConfirm,
}: Props) => {
  const { formatMessage } = useIntl();

  return (
    <Modal
      opened={opened}
      close={onCancel}
      header={
        <Title color="primary" variant="h4" m="0px">
          {formatMessage(messages.confirmTitle)}
        </Title>
      }
    >
      <Box p="20px">
        <Box mb="20px">
          <Text m="0px" textAlign="center">
            {formatMessage(messages.confirmSubmissions, {
              count: submissionCount,
            })}
          </Text>
          <Text textAlign="center">
            {formatMessage(messages.confirmExplanation)}
          </Text>
        </Box>
        <Box display="flex" justifyContent="center" gap="8px">
          <Button buttonStyle="secondary" onClick={onCancel}>
            {formatMessage(messages.cancel)}
          </Button>
          <Button
            data-cy="e2e-confirm-public-answers"
            buttonStyle="admin-dark"
            onClick={onConfirm}
          >
            {formatMessage(messages.confirm)}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default ConfirmPublicAnswersModal;
