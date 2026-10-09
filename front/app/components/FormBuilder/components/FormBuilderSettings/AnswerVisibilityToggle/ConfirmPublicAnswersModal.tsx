import React from 'react';

import { Box, Button, Text } from '@citizenlab/cl2-component-library';

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
      width={520}
      header={formatMessage(messages.confirmTitle)}
      footer={
        <Box display="flex" justifyContent="flex-end" gap="8px" width="100%">
          <Button buttonStyle="secondary-outlined" onClick={onCancel}>
            {formatMessage(messages.cancel)}
          </Button>
          <Button
            data-cy="e2e-confirm-public-answers"
            buttonStyle="primary"
            onClick={onConfirm}
          >
            {formatMessage(messages.confirm)}
          </Button>
        </Box>
      }
    >
      <Box p="24px">
        <Text m="0" mb="12px">
          {formatMessage(messages.confirmSubmissions, {
            count: submissionCount,
          })}
        </Text>
        <Text m="0">{formatMessage(messages.confirmExplanation)}</Text>
      </Box>
    </Modal>
  );
};

export default ConfirmPublicAnswersModal;
