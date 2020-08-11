import React from 'react';
import { ConsentManagerProps, IDestination } from './';
import { ADVERTISING_CATEGORIES, FUNCTIONAL_CATEGORIES } from './categories';

interface Props extends ConsentManagerProps {
  roleBlacklistedDestinationIds: string[];
  tenantBlacklistedDestinationIds: string[];
}

import Container from './Container';

/*
 * agregate the available destinations into categories
 */
const getCategorizedDestinations = (destinationArray: IDestination[]) => {
  const categorizedDestinations = {
    advertising: [] as IDestination[],
    functional: [] as IDestination[],
    analytics: [] as IDestination[],
  };

  for (const destination of destinationArray) {
    if (ADVERTISING_CATEGORIES.find((c) => c === destination.category)) {
      categorizedDestinations.advertising.push(destination);
    } else if (FUNCTIONAL_CATEGORIES.find((c) => c === destination.category)) {
      categorizedDestinations.functional.push(destination);
    } else {
      // Fallback to analytics
      categorizedDestinations.analytics.push(destination);
    }
  }

  return categorizedDestinations;
};

/*
 * removes the blacklistedDestinations from the destination and newDestinations
 * arrays, they will be programmatically set to false when saving preferences.
 */
const removeBlacklistedDestinations = (
  destinations: IDestination[],
  blacklistedDestinations: string[]
) => {
  const isNotBlackListedDestination = (destination: IDestination) =>
    !blacklistedDestinations.includes(destination.id);

  return destinations.filter(isNotBlackListedDestination);
};

const ConsentManagerBuilderHandler = ({
  setPreferences,
  resetPreferences,
  saveConsent,
  newDestinations,
  destinations,
  preferences,
  tenantBlacklistedDestinationIds,
  roleBlacklistedDestinationIds,
}: Props) => {
  // the preference object represents the previously set user preferences (= the cookie)
  const {
    tenantBlacklisted: oldTenantBlacklistedIds,
    roleBlacklisted: oldRoleBlacklistedIds,
  } = preferences;

  // all the destinations this user has no access to
  const blacklistedDestinationIds = [
    ...tenantBlacklistedDestinationIds,
    ...roleBlacklistedDestinationIds,
  ];
  // all the destinations this user didn't have access to last time consent was saved
  const oldBlacklistedDestinationIds = [
    ...(oldTenantBlacklistedIds || []),
    ...(oldRoleBlacklistedIds || []),
  ];

  // all the new destinations in segment that this user has access to
  const whitelistedNewDestinations = removeBlacklistedDestinations(
    newDestinations,
    blacklistedDestinationIds
  );

  // all the destinations that were previously disabled for this user and are no longer on their blacklists
  const noLongerBlacklisted = (oldBlacklistedDestinationIds || [])
    .filter(
      (destinationId) => !blacklistedDestinationIds.includes(destinationId)
    )
    .map((destinationId) =>
      destinations.find((destination) => destination.id === destinationId)
    )
    .filter((des) => des) as IDestination[];

  // The banner should appear...if there is new destinations that are not on a blacklist
  const isConsentRequired =
    whitelistedNewDestinations.length > 0 ||
    // if a destination was removed from the blacklists
    noLongerBlacklisted.length > 0;

  const newBlacklistedDestinationIds = tenantBlacklistedDestinationIds.filter(
    (destinationId) => !(oldTenantBlacklistedIds || []).includes(destinationId)
  );

  // is there's nothing new to show the user
  // but there is new blacklisted destinations on the tenant, we save without showing,
  // overwriting user preferences by setting blacklisted tenant items to false

  // if destinations were removed from the role black list, we don't overwrite the users consent
  // to avoid admins consenting each time they log in.
  // the non-privileged users that were once admin will be safeguarded from admin destinations in analyics.js
  if (newBlacklistedDestinationIds.length > 0 && !isConsentRequired) {
    saveConsent();
  }

  // The destinations to show the user in the consent modal.
  const whitelistedDestinations = removeBlacklistedDestinations(
    destinations,
    blacklistedDestinationIds
  );
  const categorizedDestinations = getCategorizedDestinations(
    whitelistedDestinations
  );

  return (
    <Container
      {...{
        setPreferences,
        resetPreferences,
        saveConsent,
        isConsentRequired,
        preferences,
        categorizedDestinations,
      }}
    />
  );
};

export default ConsentManagerBuilderHandler;
