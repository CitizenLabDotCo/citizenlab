import React, { FormEvent, useState, useCallback } from 'react';

// typings
import { CategorizedDestinations, IPreferences } from './typings';
import { TCategory } from './destinations';
import useObserveEvent from 'hooks/useObserveEvent';
import ConsentModal from './ConsentModal';

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
  updatePreference,
  resetPreferences,
  accept,
  reject,
  saveConsent,
}: Props) => {
  const [isCancelling, setIsCancelling] = useState(false);
  const [userUpdatingPreferences, setUserUpdatingPreferences] = useState(false);
  const [consentModalView, setConsentModalView] = useState<
    'main' | 'preferences'
  >('main');

  // If the user enters the preferences view from a button click on the footer or
  // cookie policy page, we only want to show the preferences view and not the main view.
  const openUpdatePreferencesView = useCallback(() => {
    setConsentModalView('preferences');
    setUserUpdatingPreferences(true);
  }, []);
  useObserveEvent('openConsentManager', openUpdatePreferencesView);

  const handleSave = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      saveConsent();
      setUserUpdatingPreferences(false);
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
      // If we're only viewing cookie preferences, just close the modal
      if (userUpdatingPreferences) {
        resetPreferences();
      } else {
        setConsentModalView('main');
        resetPreferences();
      }
    }
  }, [
    preferences,
    isConsentRequired,
    userUpdatingPreferences,
    resetPreferences,
  ]);

  const handleCancelBack = useCallback(() => {
    setIsCancelling(false);
    setConsentModalView('preferences');
  }, []);

  const handleCancelConfirm = useCallback(() => {
    if (userUpdatingPreferences) {
      setUserUpdatingPreferences(false);
      resetPreferences();
    } else {
      setIsCancelling(false);
      setConsentModalView('main');
      resetPreferences();
    }
  }, [resetPreferences, userUpdatingPreferences]);

  const noDestinations = Object.values(categorizedDestinations).every(
    (array) => array.length === 0
  );

  const mode = noDestinations
    ? 'noDestinations'
    : !isCancelling
    ? 'preferenceForm'
    : 'cancelling';

  const showModal = isConsentRequired || userUpdatingPreferences;

  return (
    <>
      {showModal && (
        <ConsentModal
          onAccept={accept}
          onClose={reject}
          showModal={showModal}
          categorizedDestinations={categorizedDestinations}
          updatePreference={updatePreference}
          preferences={preferences}
          mode={mode}
          handleCancelBack={handleCancelBack}
          handleCancelConfirm={handleCancelConfirm}
          handleCancel={handleCancel}
          handleSave={handleSave}
          isCancelling={isCancelling}
          view={consentModalView}
          setView={setConsentModalView}
        />
      )}
    </>
  );
};

export default Container;
