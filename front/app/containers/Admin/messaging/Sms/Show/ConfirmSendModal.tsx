import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';

import ButtonWithLink from 'components/UI/ButtonWithLink';
import Modal from 'components/UI/Modal';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../../messages';

interface Props {
  opened: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isSending: boolean;
}

const ConfirmSendModal = ({ opened, onClose, onConfirm, isSending }: Props) => (
  <Modal
    opened={opened}
    close={onClose}
    header={<FormattedMessage {...messages.confirmSendSmsHeader} />}
  >
    <Box p="30px">
      <Text mb="20px">
        <FormattedMessage {...messages.toAllUsers} />
      </Text>
      <Box display="flex" gap="10px" justifyContent="flex-end">
        <ButtonWithLink buttonStyle="secondary-outlined" onClick={onClose}>
          <FormattedMessage {...messages.changeRecipientsButton} />
        </ButtonWithLink>
        <ButtonWithLink
          buttonStyle="primary"
          icon="send"
          iconPos="right"
          onClick={onConfirm}
          processing={isSending}
          disabled={isSending}
        >
          <FormattedMessage {...messages.sendNowButton} />
        </ButtonWithLink>
      </Box>
    </Box>
  </Modal>
);

export default ConfirmSendModal;
