import React, { useState, useEffect, FormEvent } from 'react';

import { useSearchParams } from 'react-router-dom';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useAuthUser from 'api/me/useAuthUser';

import useObserveEvent from 'hooks/useObserveEvent';

import eventEmitter from 'utils/eventEmitter';
import { isNilOrError } from 'utils/helperUtils';

import {
  getConsent,
  IConsentCookie,
  ISavedDestinations,
  setConsent,
} from './consent';
import CookieModal from './CookieModal';
import { allCategories, TCategory } from './destinations';
import PreferencesModal from './PreferencesModal';
import { IPreferences } from './typings';
import {
  getCurrentPreferences,
  getActiveDestinations,
  getCategory,
  categorizeDestinations,
  getConsentRequired,
} from './utils';

const ConsentManager = () => {
  const [preferences, setPreferences] = useState<IPreferences>({
    functional: true,
  });
  const [cookieConsent, setCookieConsent] = useState<IConsentCookie | null>(
    null
  );
  const [searchParams] = useSearchParams();
  const from = searchParams.get('from');

  const [screen, setScreen] = useState<'initial' | 'preferences' | null>(null);

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
  const isConsentRequired = getConsentRequired(
    cookieConsent,
    activeDestinations
  );

  useEffect(() => {
    if (isConsentRequired) {
      setScreen('initial');
    } else {
      setScreen(null);
    }
  }, [isConsentRequired]);

  useEffect(() => {
    const cookieConsent = getConsent();
    setCookieConsent(cookieConsent);

    const defaultPreferences = getCurrentPreferences(
      appConfiguration?.data,
      authUser?.data,
      cookieConsent
    );

    if (defaultPreferences.functional === undefined) {
      defaultPreferences.functional = true;
    }

    setPreferences(defaultPreferences);

    eventEmitter.emit<ISavedDestinations>(
      'destinationConsentChanged',
      cookieConsent?.savedChoices || {}
    );
  }, [appConfiguration?.data, authUser?.data]);

  const resetPreferences = () => {
    setPreferences(
      getCurrentPreferences(
        appConfiguration?.data,
        authUser?.data,
        cookieConsent
      )
    );
  };

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

    setConsent({
      ...newPreferences,
      savedChoices: {
        ...cookieConsent?.savedChoices,
        ...newChoices,
      },
    });

    eventEmitter.emit<ISavedDestinations>(
      'destinationConsentChanged',
      newChoices
    );

    setCookieConsent(getConsent());
  };

  const accept = () => {
    const newPreferences: IPreferences = {};

    allCategories().forEach((category) => {
      newPreferences[category] =
        preferences[category] === undefined ? true : preferences[category];
    });

    setPreferences(newPreferences);
    saveConsent(newPreferences);
  };

  const reject = () => {
    const newPreferences = {
      advertising: false,
      analytics: false,
      functional: true,
    };

    setPreferences(newPreferences);
    saveConsent(newPreferences);
  };

  const toggleDefault = (modalOpened: boolean) => {
    const newPreferences: IPreferences = {};
    const modalIsCurrentlyOpening = !modalOpened;

    // If modal is currently opening: overwrite undefined preferences with false
    if (modalIsCurrentlyOpening) {
      allCategories().forEach((category) => {
        newPreferences[category] =
          preferences[category] === undefined ? false : preferences[category];
      });
    }

    // If modal is currently closing: overwrite false preferences with undefined
    if (!modalIsCurrentlyOpening) {
      allCategories().forEach((category) => {
        newPreferences[category] =
          preferences[category] === false ? undefined : preferences[category];
      });
    }

    setPreferences(newPreferences);
  };

  const openDialog = () => {
    toggleDefault(false);
    setScreen('preferences');
  };

  const closeDialog = () => {
    toggleDefault(true);
    setScreen('initial');
  };

  useObserveEvent('openConsentManager', openDialog);

  const handleSave = (e: FormEvent) => {
    e.preventDefault();

    setScreen(null);
    saveConsent(preferences);
  };

  const handleCancel = () => {
    resetPreferences();
    setScreen('initial');
  };

  return (
    <>
      {screen === 'initial' && from !== 'cookie-modal' && (
        <CookieModal
          onAccept={accept}
          onChangePreferences={openDialog}
          onClose={reject}
        />
      )}
      {screen === 'preferences' && (
        <PreferencesModal
          categorizedDestinations={activeCategorizedDestinations}
          preferences={preferences}
          handleCancel={handleCancel}
          handleSave={handleSave}
          onClose={closeDialog}
          updatePreference={updatePreference}
        />
      )}
    </>
  );
};

export default ConsentManager;
