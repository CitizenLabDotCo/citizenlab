import React from 'react';

// components
import Modal from 'components/UI/Modal';
import { Title } from '@citizenlab/cl2-component-library';
import ImportSection from './ImportSection';

interface Props {
  open: boolean;
  onClose: () => void;
}

const ImportModal = ({ open, onClose }: Props) => {
  return (
    <Modal
      fullScreen={false}
      width="780px"
      opened={open}
      close={onClose}
      header={
        <Title variant="h1" color="primary" px="24px" m="0">
          Written idea importer
        </Title>
      }
      niceHeader
    >
      <ImportSection onFinishImport={onClose} />
    </Modal>
  );
};

export default ImportModal;
