import React from 'react';

import Modal from 'components/UI/Modal';

import Footer from '../InitialScreen/Footer';
import MainContent from '../InitialScreen/MainContent';

interface Props {
  onAccept: () => void;
  onChangePreferences: () => void;
  onClose: () => void;
}

const CookieModal = ({ onAccept, onChangePreferences, onClose }: Props) => {
  return (
    <Modal
      opened
      close={onClose}
      closeOnClickOutside={false}
      hideCloseButton
      footer={
        <Footer
          onAccept={onAccept}
          onChangePreferences={onChangePreferences}
          onClose={onClose}
        />
      }
    >
      <MainContent />
    </Modal>
  );
};

export default CookieModal;
