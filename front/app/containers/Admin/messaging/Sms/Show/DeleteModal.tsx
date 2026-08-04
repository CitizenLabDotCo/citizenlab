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
  isDeleting: boolean;
}

const DeleteModal = ({ opened, onClose, onConfirm, isDeleting }: Props) => (
  <Modal
    opened={opened}
    close={onClose}
    header={<FormattedMessage {...messages.deleteSmsButton} />}
  >
    <Box p="30px">
      <Text mb="20px">
        <FormattedMessage {...messages.deleteSmsConfirmation} />
      </Text>
      <Box display="flex" gap="10px" justifyContent="flex-end">
        <ButtonWithLink buttonStyle="secondary-outlined" onClick={onClose}>
          <FormattedMessage {...messages.cancelButton} />
        </ButtonWithLink>
        <ButtonWithLink
          buttonStyle="delete"
          onClick={onConfirm}
          processing={isDeleting}
          disabled={isDeleting}
        >
          <FormattedMessage {...messages.deleteSmsButton} />
        </ButtonWithLink>
      </Box>
    </Box>
  </Modal>
);

export default DeleteModal;
