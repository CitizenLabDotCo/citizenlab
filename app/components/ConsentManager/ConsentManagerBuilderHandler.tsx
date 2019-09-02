import React from 'react';
import { ConsentManagerProps, IDestination } from './';
import { ADVERTISING_CATEGORIES, FUNCTIONAL_CATEGORIES } from './categories';

interface Props extends ConsentManagerProps {
  blacklistedDestinations: string[];
}

import Container from './Container';

const getCategorizedDestinations = (destinationArray: IDestination[]) => {
  const categorizedDestinations = {
    advertising: [] as IDestination[],
    functional: [] as IDestination[],
    analytics: [] as IDestination[],
  };
  for (const destination of destinationArray) {
    if (ADVERTISING_CATEGORIES.find(c => c === destination.category)) {
      categorizedDestinations.advertising.push(destination);
    } else if (FUNCTIONAL_CATEGORIES.find(c => c === destination.category)) {
      categorizedDestinations.functional.push(destination);
    } else {
      // Fallback to analytics
      categorizedDestinations.analytics.push(destination);
    }
  }
  return categorizedDestinations;
};

const ConsentManagerBuilderHandler = ({
  setPreferences,
  resetPreferences,
  saveConsent,
  newDestinations,
  destinations,
  preferences,
  blacklistedDestinations
}: Props) => {

  const filteredNewDestinations = newDestinations.filter(destination => !blacklistedDestinations.includes(destination.id));
  const filteredDestinations = destinations.filter(destination => !blacklistedDestinations.includes(destination.id));
  const categorizedDestinations = getCategorizedDestinations(filteredDestinations);

  if (blacklistedDestinations !== preferences.tenantBlacklisted) {
    const noLongerBlacklisted = (preferences.tenantBlacklisted || []).filter(destinationId => !blacklistedDestinations.includes(destinationId));
    noLongerBlacklisted.forEach(id => {
      const destination = destinations.find(destination => destination.id === id);
      if (destination) {
        filteredNewDestinations.push(destination);
      }
    });
    const newBlacklistEntries = blacklistedDestinations.filter(destinationId => !(preferences.tenantBlacklisted || []).includes(destinationId));
    if (newBlacklistEntries.length > 0 && filteredNewDestinations.length === 0) {
      saveConsent();
    }
  }
  const isConsentRequired = filteredNewDestinations.length > 0;

  return (
    <Container
      {...{
        setPreferences,
        resetPreferences,
        saveConsent,
        isConsentRequired,
        preferences,
        categorizedDestinations
      }}
    />
  );
};

export default ConsentManagerBuilderHandler;
