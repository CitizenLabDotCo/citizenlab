import React, { useState, useCallback, useMemo, useEffect } from 'react';

// components
import Container from './Container';

// cookies
import {
  getConsent,
  IConsentCookie,
  ISavedDestinations,
  setConsent,
} from './consent';
import {
  allCategories,
  getDestinationConfigs,
  IDestination,
  IDestinationConfig,
  isDestinationActive,
  TCategory,
} from './destinations';

// utils
import { isNilOrError } from 'utils/helperUtils';
import eventEmitter from 'utils/eventEmitter';

// typings
import { IAppConfigurationData } from 'services/appConfiguration';

// the format in which the user will make its choices,
export type IPreferences = Partial<Record<TCategory, boolean>>;

// the format in which we'll present the destinations to the user
export type CategorizedDestinations = Record<TCategory, IDestination[]>;

const ConsentManager = () => {
  const [preferences, setPreferences] = useState<IPreferences>({});
  const [cookieConsent, setCookieConsent] = useState<IConsentCookie | null>(
    null
  );

  useEffect(() => {
    const cookieConsent = getConsent();
    setCookieConsent(cookieConsent);

    eventEmitter.emit<ISavedDestinations>(
      'destinationConsentChanged',
      cookieConsent?.savedChoices || {}
    );
  }, []);
};

export default ConsentManager;
