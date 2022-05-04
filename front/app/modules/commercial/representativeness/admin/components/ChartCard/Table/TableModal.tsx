import React from 'react';

// hooks
import useLocalize from 'hooks/useLocalize';

// components
import Modal from 'components/UI/Modal';
import { Title } from '@citizenlab/cl2-component-library';
import Table from './Table';

// typings
import { Multiloc } from 'typings';
import { RepresentativenessData } from '..';

interface Props {
  open: boolean;
  titleMultiloc: Multiloc;
  columns: string[];
  data: RepresentativenessData;
  onClose: () => void;
}

const TableModal = ({ open, titleMultiloc, columns, data, onClose }: Props) => {
  const localize = useLocalize();

  return (
    <Modal opened={open} close={onClose} width="70%">
      <Title>{localize(titleMultiloc)}</Title>
      <Table columns={columns} data={data} />
    </Modal>
  );
};

export default TableModal;
