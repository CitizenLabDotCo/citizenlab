import React, { FormEvent, useState } from 'react';

import useObserveEvent from 'hooks/useObserveEvent';

import CookieModal from './CookieModal';
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
  const [isPreferencesModalOpened, setIsPreferencesModalOpened] =
    useState(false);

  const openDialog = () => {
    onToggleModal(false);
    setIsPreferencesModalOpened(true);
  };

  const closeDialog = () => {
    onToggleModal(true);
    setIsPreferencesModalOpened(false);
  };

  useObserveEvent('openConsentManager', openDialog);

  const handleSave = (e: FormEvent) => {
    e.preventDefault();

    setIsPreferencesModalOpened(false);
    saveConsent();
  };

  const handleCancel = () => {
    resetPreferences();
    setIsPreferencesModalOpened(false);
  };

  return (
    <>
      <PreferencesModal
        opened={isPreferencesModalOpened}
        categorizedDestinations={categorizedDestinations}
        preferences={preferences}
        handleCancel={handleCancel}
        handleSave={handleSave}
        onClose={closeDialog}
        updatePreference={updatePreference}
      />

      {isConsentRequired && (
        <CookieModal
          onAccept={accept}
          onChangePreferences={openDialog}
          onClose={reject}
        />
      )}
    </>
  );
};

export default Container;
