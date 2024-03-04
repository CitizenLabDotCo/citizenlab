import React from 'react';

import { Title } from '@citizenlab/cl2-component-library';

import Modal from 'components/UI/Modal';

import { FormattedMessage } from 'utils/cl-intl';

import ImportSection from './ImportSection';
import messages from './messages';

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
