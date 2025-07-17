import React, { FormEvent } from 'react';

import Modal from 'components/UI/Modal';

import { TCategory } from '../destinations';
import { CategorizedDestinations, IPreferences } from '../typings';

import Footer from './Footer';
import MainContent from './MainContent';

interface Props {
  categorizedDestinations: CategorizedDestinations;
  preferences: IPreferences;
  onClose: () => void;
  handleCancel: () => void;
  handleSave: (e: FormEvent) => void;
  updatePreference: (category: TCategory, value: boolean) => void;
}

const PreferencesModal = ({
  categorizedDestinations,
  preferences,
  onClose,
  handleCancel,
  handleSave,
  updatePreference,
}: Props) => {
  return (
    <Modal
      opened
      close={onClose}
      closeOnClickOutside={false}
      hideCloseButton
      footer={
        <Footer
          categorizedDestinations={categorizedDestinations}
          handleCancel={handleCancel}
          handleSave={handleSave}
        />
      }
    >
      <MainContent
        onChange={updatePreference}
        categoryDestinations={categorizedDestinations}
        preferences={preferences}
      />
    </Modal>
  );
};

export default PreferencesModal;
