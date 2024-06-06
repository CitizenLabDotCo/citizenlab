import React from 'react';

import { Title, Box } from '@citizenlab/cl2-component-library';

import Modal from 'components/UI/Modal';

import { FormattedMessage } from 'utils/cl-intl';

import { ProjectId, Dates } from '../typings';

import messages from './messages';
import Table from './Table';

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
      <Title styleVariant="h2" as="h2" mt="4px" mb="0px" color="primary">
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
