import React, { FormEvent, useState, useEffect, useCallback } from 'react';

// components
import PreferencesModal from './PreferencesModal';
import Banner from './Banner';

// events
import eventEmitter from 'utils/eventEmitter';

// typings
import { CategorizedDestinations, IPreferences } from './typings';
import { TCategory } from './destinations';

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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const openDialog = useCallback(() => {
    onToggleModal(false);
    setIsDialogOpen(true);
  }, [onToggleModal]);

  const closeDialog = useCallback(() => {
    onToggleModal(true);
    setIsDialogOpen(false);
  }, [onToggleModal]);

  useEffect(() => {
    const subscription = eventEmitter
      .observeEvent('openConsentManager')
      .subscribe(openDialog);

    return () => subscription.unsubscribe();
  }, [openDialog]);

  const handleSave = useCallback(
    (e: FormEvent<any>) => {
      e.preventDefault();

      setIsDialogOpen(false);
      saveConsent();
    },
    [saveConsent]
  );

  const handleCancel = useCallback(() => {
    const isEmpty = Object.values(preferences).every((e) => e === undefined);

    // Only show the cancel confirmation if there's unconsented destinations...
    // or if the user made a choice and we want to confirm aborting it
    if (isConsentRequired && !isEmpty) {
      setIsCancelling(true);
    } else {
      setIsDialogOpen(false);
      resetPreferences();
    }
  }, [preferences, isConsentRequired, resetPreferences]);

  const handleCancelBack = useCallback(() => {
    setIsCancelling(false);
  }, []);

  const handleCancelConfirm = useCallback(() => {
    setIsCancelling(false);
    setIsDialogOpen(false);

    resetPreferences();
  }, [resetPreferences]);

  const noDestinations = Object.values(categorizedDestinations).every(
    (array) => array.length === 0
  );

  const mode = noDestinations
    ? 'noDestinations'
    : !isCancelling
    ? 'preferenceForm'
    : 'cancelling';

  return (
    <>
      <PreferencesModal
        opened={isDialogOpen}
        mode={mode}
        categorizedDestinations={categorizedDestinations}
        preferences={preferences}
        isCancelling={isCancelling}
        handleCancelBack={handleCancelBack}
        handleCancelConfirm={handleCancelConfirm}
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
