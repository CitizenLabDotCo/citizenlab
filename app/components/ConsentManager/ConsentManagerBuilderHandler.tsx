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

  // removes the blacklistedDestinations from the destination and newDestinations
  // arrays, they will be programmatically set to false when saving preferences.
  const filteredNewDestinations = newDestinations.filter(destination => !blacklistedDestinations.includes(destination.id));
  const filteredDestinations = destinations.filter(destination => !blacklistedDestinations.includes(destination.id));
  // agregate the remaining destinations into categories.
  const categorizedDestinations = getCategorizedDestinations(filteredDestinations);

  // if there was a previous consent and the blaclist on the tenant has changes since then
  if (blacklistedDestinations !== preferences.tenantBlacklisted) {
    // anything that was removed from the blacklist is a new destination to our user
    const noLongerBlacklisted = (preferences.tenantBlacklisted || []).filter(destinationId => !blacklistedDestinations.includes(destinationId));
    noLongerBlacklisted.forEach(id => {
      const destination = destinations.find(destination => destination.id === id);
      if (destination) {
        filteredNewDestinations.push(destination);
      }
    });
    // anything that was added to the blacklist will be programmatically set to false later...
    const newBlacklistEntries = blacklistedDestinations.filter(destinationId => !(preferences.tenantBlacklisted || []).includes(destinationId));
    // if there is no new destinations, the banner won't show so we save programmatically to apply
    // the blacklist on the preious user choice and overwrite blacklisted destinations to false
    if (newBlacklistEntries.length > 0 && filteredNewDestinations.length === 0) {
      saveConsent();
    }
  }
  // if there is a new destination the user has not consented to, consent is required
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
