import React, { useState, useEffect, FormEvent } from 'react';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useAuthUser from 'api/me/useAuthUser';

import useObserveEvent from 'hooks/useObserveEvent';

import eventEmitter from 'utils/eventEmitter';
import { isNilOrError } from 'utils/helperUtils';

import Banner from './Banner';
import {
  getConsent,
  IConsentCookie,
  ISavedDestinations,
  setConsent,
} from './consent';
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
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: appConfiguration } = useAppConfiguration();
  const { data: authUser } = useAuthUser();

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
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    toggleDefault(true);
    setIsDialogOpen(false);
  };

  useObserveEvent('openConsentManager', openDialog);

  const handleSave = (e: FormEvent) => {
    e.preventDefault();

    setIsDialogOpen(false);
    saveConsent(preferences);
  };

  const handleCancel = () => {
    resetPreferences();
    setIsDialogOpen(false);
  };

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

  return (
    <>
      {isConsentRequired && (
        <Banner
          onAccept={accept}
          onChangePreferences={openDialog}
          onClose={reject}
        />
      )}
      <PreferencesModal
        opened={isDialogOpen}
        categorizedDestinations={activeCategorizedDestinations}
        preferences={preferences}
        handleCancel={handleCancel}
        handleSave={handleSave}
        onClose={closeDialog}
        updatePreference={updatePreference}
      />
    </>
  );
};

export default ConsentManager;
