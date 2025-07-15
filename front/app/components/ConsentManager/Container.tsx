import React, { FormEvent, useState } from 'react';

import useObserveEvent from 'hooks/useObserveEvent';

import Banner from './Banner';
import { TCategory } from './destinations';
import PreferencesModal from './PreferencesModal';
import { CategorizedDestinations, IPreferences } from './typings';

interface Props {
  preferences: IPreferences;
  categorizedDestinations: CategorizedDestinations;
  isConsentRequired: boolean;
  onToggleModal: (opened: boolean) => void;
  updatePreference: (category: TCategory, value: boolean) => void;
  resetPreferences: () => void;
  accept: () => void;
  reject: () => void;
  saveConsent: () => void;
}

export type FormMode = 'preferenceForm' | 'noDestinations';

const Container = ({
  preferences,
  categorizedDestinations,
  isConsentRequired,
  onToggleModal,
  updatePreference,
  resetPreferences,
  accept,
  reject,
  saveConsent,
}: Props) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const openDialog = () => {
    onToggleModal(false);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    onToggleModal(true);
    setIsDialogOpen(false);
  };

  useObserveEvent('openConsentManager', openDialog);

  const handleSave = (e: FormEvent) => {
    e.preventDefault();

    setIsDialogOpen(false);
    saveConsent();
  };

  const handleCancel = () => {
    resetPreferences();
    setIsDialogOpen(false);
  };

  return (
    <>
      <PreferencesModal
        opened={isDialogOpen}
        categorizedDestinations={categorizedDestinations}
        preferences={preferences}
        handleCancel={handleCancel}
        handleSave={handleSave}
        onClose={closeDialog}
        updatePreference={updatePreference}
      />

      {isConsentRequired && (
        <Banner
          onAccept={accept}
          onChangePreferences={openDialog}
          onClose={reject}
        />
      )}
    </>
  );
};

export default Container;
