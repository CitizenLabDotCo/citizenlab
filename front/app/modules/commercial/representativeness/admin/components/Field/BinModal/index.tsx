import React from 'react';

// components
import Modal from 'components/UI/Modal';
import { Title } from '@citizenlab/cl2-component-library';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

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
      <Title variant="h3" mt="0px" mb="0px">
        <FormattedMessage {...messages.ageGroups} />
      </Title>
    }
  >
    <>BLA</>
  </Modal>
);

export default BinModal;
