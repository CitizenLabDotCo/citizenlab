import React, { useState, useCallback, useMemo, useEffect } from 'react';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useAuthUser from 'api/me/useAuthUser';

import eventEmitter from 'utils/eventEmitter';
import { isNilOrError } from 'utils/helperUtils';

import {
  getConsent,
  IConsentCookie,
  ISavedDestinations,
  setConsent,
} from './consent';
import Container from './Container';
import { allCategories, TCategory } from './destinations';
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

  const { data: appConfiguration } = useAppConfiguration();
  const { data: authUser } = useAuthUser();

  const resetPreferences = useCallback(() => {
    setPreferences(
      getCurrentPreferences(
        appConfiguration?.data,
        authUser?.data,
        cookieConsent
      )
    );
  }, [appConfiguration, authUser, cookieConsent]);

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

  const updatePreference = useCallback(
    (category: TCategory, value: boolean) => {
      setPreferences((preferences) => ({
        ...preferences,
        [category]: value,
      }));
    },
    []
  );

  const saveConsent = useCallback(
    (newPreferences: IPreferences) => {
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
    },
    [appConfiguration, authUser, cookieConsent?.savedChoices]
  );

  const onSaveConsent = () => saveConsent(preferences);

  const accept = useCallback(() => {
    const newPreferences: IPreferences = {};

    allCategories().forEach((category) => {
      newPreferences[category] =
        preferences[category] === undefined ? true : preferences[category];
    });

    setPreferences(newPreferences);
    saveConsent(newPreferences);
  }, [preferences, saveConsent]);

  const reject = useCallback(() => {
    const newPreferences = {
      advertising: false,
      analytics: false,
      functional: true,
    };

    setPreferences(newPreferences);
    saveConsent(newPreferences);
  }, [saveConsent]);

  const toggleDefault = useCallback(
    (modalOpened: boolean) => {
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
    },
    [preferences]
  );

  const activeDestinations = useMemo(
    () => getActiveDestinations(appConfiguration?.data, authUser?.data),
    [appConfiguration, authUser]
  );

  const activeCategorizedDestinations = useMemo(
    () => categorizeDestinations(appConfiguration?.data, activeDestinations),
    [appConfiguration, activeDestinations]
  );

  const isConsentRequired = useMemo(
    () => getConsentRequired(cookieConsent, activeDestinations),
    [cookieConsent, activeDestinations]
  );

  return (
    <Container
      accept={accept}
      reject={reject}
      onToggleModal={toggleDefault}
      updatePreference={updatePreference}
      resetPreferences={resetPreferences}
      saveConsent={onSaveConsent}
      isConsentRequired={isConsentRequired}
      preferences={preferences}
      categorizedDestinations={activeCategorizedDestinations}
    />
  );
};

export default ConsentManager;
