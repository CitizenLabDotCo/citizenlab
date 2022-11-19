import React from 'react';

// components
import Modal from 'components/UI/Modal';
import { Title, Box } from '@citizenlab/cl2-component-library';
import Table from './Table';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

// typings
import { ProjectId, Dates } from '../../typings';

type Props = ProjectId &
  Dates & {
    open: boolean;
    onClose: () => void;
  };

const TableModal = ({ open, onClose, ...tableProps }: Props) => (
  <Modal
    opened={open}
    close={onClose}
    width="70%"
    header={
      <Title variant="h2" as="h2" mt="4px" mb="0px" color="primary">
        <FormattedMessage {...messages.referrers} />
      </Title>
    }
  >
    <Box py="20px">
      <Table {...tableProps} />
    </Box>
  </Modal>
);

export default TableModal;
