import React from 'react';

import { Box, Text, Title } from '@citizenlab/cl2-component-library';

import ButtonWithLink from 'components/UI/ButtonWithLink';
import Modal from 'components/UI/Modal';

import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';

type Props = {
  opened: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

const ConfirmGenerationModal = ({ opened, onClose, onConfirm }: Props) => (
  <Modal
    opened={opened}
    close={onClose}
    ariaLabelledBy="confirm-survey-generation-title"
  >
    <Box display="flex" flexDirection="column" p="20px">
      <Title id="confirm-survey-generation-title" variant="h3" color="primary">
        <FormattedMessage {...messages.confirmTitle} />
      </Title>
      <Text color="primary" mb="32px">
        <FormattedMessage {...messages.confirmText} />
      </Text>
      <Box display="flex" gap="16px">
        <ButtonWithLink
          type="button"
          buttonStyle="secondary-outlined"
          width="100%"
          onClick={onClose}
        >
          <FormattedMessage {...messages.cancel} />
        </ButtonWithLink>
        <ButtonWithLink
          type="button"
          buttonStyle="delete"
          width="100%"
          onClick={onConfirm}
        >
          <FormattedMessage {...messages.confirm} />
        </ButtonWithLink>
      </Box>
    </Box>
  </Modal>
);

export default ConfirmGenerationModal;
