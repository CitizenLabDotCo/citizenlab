import React, { FormEvent } from 'react';

import Modal from 'components/UI/Modal';

import { TCategory } from '../destinations';
import { CategorizedDestinations, IPreferences } from '../typings';

import Footer from './Footer';
import Preferences from './Preferences';

interface Props {
  opened: boolean;
  categorizedDestinations: CategorizedDestinations;
  preferences: IPreferences;
  onClose: () => void;
  handleCancel: () => void;
  handleSave: (e: FormEvent) => void;
  updatePreference: (category: TCategory, value: boolean) => void;
}

const PreferencesModal = ({
  opened,
  categorizedDestinations,
  preferences,
  onClose,
  handleCancel,
  handleSave,
  updatePreference,
}: Props) => {
  return (
    <Modal
      opened={opened}
      close={onClose}
      footer={
        <Footer
          categorizedDestinations={categorizedDestinations}
          handleCancel={handleCancel}
          handleSave={handleSave}
        />
      }
      closeOnClickOutside={false}
      hideCloseButton
    >
      <Preferences
        onChange={updatePreference}
        categoryDestinations={categorizedDestinations}
        preferences={preferences}
      />
    </Modal>
  );
};

export default PreferencesModal;
