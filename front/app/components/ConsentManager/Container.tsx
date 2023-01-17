import React, { FormEvent, useState, useEffect, useCallback } from 'react';

// components
import Banner from './Banner';
import PreferencesDialog, { ContentContainer } from './PreferencesDialog';
import Footer from './Footer';
import Modal from 'components/UI/Modal';

// events
import eventEmitter from 'utils/eventEmitter';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// utils
import { keys } from 'utils/helperUtils';

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
  }, []);

  const validate = useCallback(() => {
    for (const category of keys(categorizedDestinations)) {
      const categoryHasDestinations =
        categorizedDestinations[category].length > 0;
      const preferenceIsUndefined = preferences[category] === undefined;

      if (categoryHasDestinations && preferenceIsUndefined) {
        return false;
      }
    }

    return true;
  }, []);

  const handleSave = useCallback(
    (e: FormEvent<any>) => {
      e.preventDefault();

      if (validate()) {
        return;
      }

      setIsDialogOpen(false);
      saveConsent();
    },
    [validate, saveConsent]
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
      <Modal
        opened={isDialogOpen}
        close={closeDialog}
        header={<FormattedMessage {...messages.title} />}
        footer={
          <Footer
            validate={validate}
            mode={mode}
            handleCancelBack={handleCancelBack}
            handleCancelConfirm={handleCancelConfirm}
            handleCancel={handleCancel}
            handleSave={handleSave}
          />
        }
      >
        {!isCancelling ? (
          <PreferencesDialog
            onChange={updatePreference}
            categoryDestinations={categorizedDestinations}
            preferences={preferences}
          />
        ) : (
          <ContentContainer role="dialog" aria-modal>
            <FormattedMessage {...messages.confirmation} tagName="h1" />
          </ContentContainer>
        )}
      </Modal>

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
