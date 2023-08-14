import React from 'react';

// components
import Modal from 'components/UI/Modal';
import { Button } from '@citizenlab/cl2-component-library';

interface Props {
  open: boolean;
  onClose: () => void;
  onExport: (params: { name: boolean; email: boolean }) => Promise<void>;
}

const PDFExportModal = ({ open, onClose, onExport }: Props) => {
  const handleExport = async () => {
    await onExport({ name: true, email: true });
    onClose();
  };

  return (
    <Modal
      fullScreen={false}
      width="580px"
      opened={open}
      close={onClose}
      header={<>Header</>}
      niceHeader
    >
      Bla <br />
      <Button onClick={handleExport}>Export</Button>
    </Modal>
  );
};

export default PDFExportModal;
