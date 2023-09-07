import React from 'react';

// components
import Modal from 'components/UI/Modal';
import { Title } from '@citizenlab/cl2-component-library';
import ImportSection from './ImportSection';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

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
        <Title variant="h2" color="primary" px="24px" m="0">
          <FormattedMessage {...messages.inputImporter} />
        </Title>
      }
      niceHeader
    >
      <ImportSection onFinishImport={onClose} />
    </Modal>
  );
};

export default ImportModal;
