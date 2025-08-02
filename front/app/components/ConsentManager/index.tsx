import React, { useState, useEffect, FormEvent } from 'react';

import { useSearchParams } from 'react-router-dom';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useAuthUser from 'api/me/useAuthUser';

import useObserveEvent from 'hooks/useObserveEvent';

import Modal from 'components/UI/Modal';

import eventEmitter from 'utils/eventEmitter';
import { isNilOrError } from 'utils/helperUtils';

import { getConsent, ISavedDestinations, setConsent } from './consent';
import { allCategories, TCategory } from './destinations';
import InitialScreenFooter from './InitialScreen/Footer';
import InitialScreenMainContent from './InitialScreen/MainContent';
import PreferencesScreenFooter from './PreferencesScreen/Footer';
import PreferencesScreenMainContent from './PreferencesScreen/MainContent';
import { IPreferences } from './typings';
import {
  getCurrentPreferences,
  getActiveDestinations,
  getCategory,
  categorizeDestinations,
  useConsentRequired,
} from './utils';

const ConsentManager = () => {
  const [preferences, setPreferences] = useState<IPreferences>({
    functional: true,
  });
  const [screen, setScreen] = useState<'initial' | 'preferences' | null>(null);
  const [searchParams] = useSearchParams();
  const from = searchParams.get('from');

  const { data: appConfiguration } = useAppConfiguration();
  const { data: authUser } = useAuthUser();
  const activeDestinations = getActiveDestinations(
    appConfiguration?.data,
    authUser?.data
  );
  const activeCategorizedDestinations = categorizeDestinations(
    appConfiguration?.data,
    activeDestinations
  );

  const isConsentRequired = useConsentRequired(activeDestinations);

  useEffect(() => {
    /*
      When we click the link to the cookie policy in the modal, 
      we wouldn't be able to read the cookie policy without this, 
      because the modal is on top of the page.
      Search the codebase for 'from=cookie-modal' to see where this is used.
    */
    if (from === 'cookie-modal') {
      setScreen(null);
    } else if (isConsentRequired) {
      setScreen('initial');
    } else {
      setScreen(null);
    }
  }, [from, isConsentRequired]);

  useEffect(() => {
    const consent = getConsent();

    const defaultPreferences = getCurrentPreferences(
      appConfiguration?.data,
      authUser?.data,
      consent
    );

    if (defaultPreferences.functional === undefined) {
      defaultPreferences.functional = true;
    }

    setPreferences(defaultPreferences);

    eventEmitter.emit<ISavedDestinations>(
      'destinationConsentChanged',
      consent?.savedChoices || {}
    );
  }, [appConfiguration?.data, authUser?.data]);

  const updatePreference = (category: TCategory, value: boolean) => {
    setPreferences((preferences) => ({
      ...preferences,
      [category]: value,
    }));
  };

  const saveConsent = (newPreferences: IPreferences) => {
    if (isNilOrError(appConfiguration)) return;
    const newChoices: ISavedDestinations = {};

    getActiveDestinations(appConfiguration.data, authUser?.data).forEach(
      (config) => {
        newChoices[config.key] =
          newPreferences[getCategory(appConfiguration.data, config)];
      }
    );

    const consent = getConsent();
    setConsent({
      ...newPreferences,
      savedChoices: {
        ...consent?.savedChoices,
        ...newChoices,
      },
    });

    eventEmitter.emit<ISavedDestinations>(
      'destinationConsentChanged',
      newChoices
    );
  };

  const accept = () => {
    const newPreferences: IPreferences = Object.fromEntries(
      allCategories().map((category) => [category, true])
    );

    // Setting preferences here is needed to ensure that the modal remembers choices after accepting all cookies.
    // Without this, the modal would not be able to remember choices without a page reload.
    setPreferences(newPreferences);
    saveConsent(newPreferences);
    setScreen(null);
  };

  const reject = () => {
    // Only set functional cookies to true, as these are always needed for the app to function correctly.
    // Other categories will be set to false, as the user has rejected them.
    const newPreferences: IPreferences = Object.fromEntries(
      allCategories().map((category) => [category, category === 'functional'])
    );

    // Setting preferences here is needed to ensure that the modal can remember choices after rejecting all cookies.
    // Otherwise, the modal may not be able to show correct choices without a page reload.
    setPreferences(newPreferences);
    saveConsent(newPreferences);
    setScreen(null);
  };

  const toggleDefault = () => {
    const newPreferences: IPreferences = {};

    allCategories().forEach((category) => {
      newPreferences[category] =
        preferences[category] === undefined ? false : preferences[category];
    });

    setPreferences(newPreferences);
  };

  const openPreferencesScreen = () => {
    toggleDefault();
    setScreen('preferences');
  };

  const openInitialScreen = () => {
    setScreen('initial');
  };

  useObserveEvent('openConsentManager', openInitialScreen);

  const savePreferences = (e: FormEvent) => {
    e.preventDefault();

    saveConsent(preferences);
    setScreen(null);
  };

  const cancelPrefencesScreen = () => {
    // reset preferences to the current consent cookie
    const consent = getConsent();
    setPreferences(
      getCurrentPreferences(appConfiguration?.data, authUser?.data, consent)
    );
    setScreen('initial');
  };

  if (screen === null) {
    return null;
  }

  return (
    <Modal
      data-testid="consent-manager"
      opened
      closeOnClickOutside={false}
      hideCloseButton
      close={reject}
      footer={
        <>
          {screen === 'initial' && (
            <InitialScreenFooter
              onAccept={accept}
              openPreferencesScreen={openPreferencesScreen}
              onClose={reject}
            />
          )}
          {screen === 'preferences' && (
            <PreferencesScreenFooter
              categorizedDestinations={activeCategorizedDestinations}
              handleCancel={cancelPrefencesScreen}
              handleSave={savePreferences}
            />
          )}
        </>
      }
    >
      {screen === 'initial' && <InitialScreenMainContent />}
      {screen === 'preferences' && (
        <PreferencesScreenMainContent
          onChange={updatePreference}
          categoryDestinations={activeCategorizedDestinations}
          preferences={preferences}
        />
      )}
    </Modal>
  );
};

export default ConsentManager;
