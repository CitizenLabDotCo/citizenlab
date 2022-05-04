import React from 'react';

// components
import Modal from 'components/UI/Modal';
import Table from './Table';

// typings
import { RepresentativenessData } from '..';

interface Props {
  open: boolean;
  columns: string[];
  data: RepresentativenessData;
  onClose: () => void;
}

const TableModal = ({ open, columns, data, onClose }: Props) => {
  return (
    <Modal opened={open} close={onClose} width="70%">
      <Table columns={columns} data={data} />
    </Modal>
  );
};

export default TableModal;
