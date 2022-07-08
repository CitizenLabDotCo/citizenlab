import React from 'react';

// components
import Modal from 'components/UI/Modal';
import { Box } from '@citizenlab/cl2-component-library';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

// styling
import { colors } from 'utils/styleUtils';

interface Props {
  open: boolean;
  onClose: () => void;
}

const BinModal = ({ open, onClose }: Props) => (
  <Modal
    opened={open}
    close={onClose}
    width="70%"
    header={
      <Box color={colors.adminTextColor} style={{ fontWeight: 700 }}>
        <FormattedMessage {...messages.ageGroups} />
      </Box>
    }
  >
    <Box p="28px">
      <FormattedMessage {...messages.modalDescription} />
    </Box>
  </Modal>
);

export default BinModal;
