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
  onToggleModal,
  updatePreference,
  resetPreferences,
  accept,
  reject,
  saveConsent,
}: Props) => {
  const [isCancelling, setIsCancelling] = useState(false);
  const [showConsentModal, setShowConsentModal] = useState(isConsentRequired);
  const [consentModalView, setConsentModalView] = useState<
    'main' | 'preferences'
  >('main');

  const openDialog = useCallback(() => {
    onToggleModal(false); // TODO: Need to implement that when openConsentManager fired, open the modal to preferences view
  }, [onToggleModal]);

  useObserveEvent('openConsentManager', openDialog);

  const handleSave = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      saveConsent();
      setShowConsentModal(false);
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
      setConsentModalView('main');
      resetPreferences();
    }
  }, [preferences, isConsentRequired, resetPreferences]);

  const handleCancelBack = useCallback(() => {
    setIsCancelling(false);
    setConsentModalView('preferences');
  }, []);

  const handleCancelConfirm = useCallback(() => {
    setIsCancelling(false);
    setConsentModalView('main');

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
      {isConsentRequired && (
        <ConsentModal
          onAccept={accept}
          onClose={reject}
          showModal={showConsentModal}
          setShowModal={setShowConsentModal}
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
