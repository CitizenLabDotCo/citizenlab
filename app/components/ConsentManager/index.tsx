import React, { PureComponent } from 'react';
import { ConsentManagerBuilder } from '@segment/consent-manager';
import { CL_SEGMENT_API_KEY } from 'containers/App/constants';
import { adopt } from 'react-adopt';
import { withScope } from '@sentry/browser';
import { isAdmin, isSuperAdmin, isModerator } from 'services/permissions/roles';

import { ADVERTISING_CATEGORIES, FUNCTIONAL_CATEGORIES, MARKETING_AND_ANALYTICS_CATEGORIES } from './categories';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { reportError } from 'utils/loggingUtils';

// components
import ConsentManagerBuilderHandler from './ConsentManagerBuilderHandler';

// resources
import GetTenant, { GetTenantChildProps } from 'resources/GetTenant';
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';

export const adminIntegrations = ['Intercom', 'SatisMeter'];
export const superAdminIntegrationsBl = ['SatisMeter'];

// 3rd parties will receive events (Facebook, Google, ...). A destination is an object that represents such a 3rd party.
// Also called integrations. Below is the format in which Sentry sends out destinations.
export interface IDestination {
  id: string;
  name: string;
  description: string;
  website: string;
  category: string;
}

// the format in which the user will make its choices,
// plus a way to remember tenantSettings last time the user gave consent.
export interface CustomPreferences {
  analytics: boolean | null;
  advertising: boolean | null;
  functional: boolean | null;
  tenantBlacklisted?: string[] | undefined;
  roleBlacklisted?: string[] | undefined;
}

// the format in which we'll present the destinations to the user
export interface CategorizedDestinations {
  analytics: IDestination[];
  advertising: IDestination[];
  functional: IDestination[];
}

// initially, preferences are set to null
export const initialPreferences = {
  analytics: null,
  advertising: null,
  functional: null
};

// the interface of the object that Segment's consent manager will pass down to its child
export interface ConsentManagerProps {
  setPreferences: Function;
  resetPreferences: () => void;
  saveConsent: () => void;
  destinations: IDestination[];
  newDestinations: IDestination[];
  preferences: CustomPreferences;
  // isConsentRequired: boolean; // passed down by SCM  based on whether user is the EU, but we'll overwrite this
  // implyConsentOnInteraction: boolean; // not in use here but passed through by SCM, defaults to false
}

interface InputProps { }
interface DataProps {
  tenant: GetTenantChildProps;
  authUser: GetAuthUserChildProps;
}
interface Props extends InputProps, DataProps { }

function reportToSegment(err) {
  withScope(scope => {
    scope.setExtra('explanation', 'Segment destination fetch has failed, probably blocked by ad-blocker');
    reportError(err);
  });
}

function handleMapCustomPreferences(
  tenantBlacklistedDestinationIds: string[] | undefined,
  roleBlacklistedDestinationIds: string[] | undefined) {
  return function _(
    destinations: IDestination[],
    preferences: CustomPreferences,
  ) {
    /** takes in the full list of destinations (coming from Segment),
    * the preferences set by the user and the destinations that the user doesn't have access to
    * gives out both the custom preferences picked by the user to save and the preferences
    * of the user in the format { [preferenceId]: booleanConsent }
    **/

    const blacklistedDestinationIds = [...tenantBlacklistedDestinationIds || [], ...roleBlacklistedDestinationIds || []];
    const whitelistedDestinations = removeBlacklistedDestinations(destinations, blacklistedDestinationIds);

    const customPreferences = getCustomPreferences(preferences, whitelistedDestinations, tenantBlacklistedDestinationIds || [], roleBlacklistedDestinationIds || []);

    const destinationPreferences = {
      ...getDestinationPreferences(customPreferences, whitelistedDestinations),
      ...formatBlacklistDestinations(blacklistedDestinationIds)
    };

    return {
      customPreferences,
      destinationPreferences
    } as { customPreferences: CustomPreferences, destinationPreferences: { [destinationId: string]: boolean } };
  };
}

function getCustomPreferences(
  preferences: CustomPreferences,
  accessibleDestinations: IDestination[],
  tenantBlacklistedDestinationIds: string[],
  roleBlacklistedDestinationIds: string[]
) {
  const customPreferences = {} as CustomPreferences;

  for (const [preferenceName, value] of Object.entries(preferences)) {
    // use user preference if set
    if (typeof value === 'boolean') {
      customPreferences[preferenceName] = value;

      // for categories that contain destinations (for implicit consent) default unset preferences to true (clicking accept without opening)
    } else if (preferenceName === 'advertising' && accessibleDestinations.find(destination => ADVERTISING_CATEGORIES.includes(destination.category))) {
      customPreferences['advertising'] = true;
    } else if (preferenceName === 'functional' && accessibleDestinations.find(destination => FUNCTIONAL_CATEGORIES.includes(destination.category))) {
      customPreferences['functional'] = true;
    } else if (preferenceName === 'analytics' && accessibleDestinations.find(destination => MARKETING_AND_ANALYTICS_CATEGORIES.includes(destination.category))) {
      customPreferences['analytics'] = true;
      // and leave the empty categories null
    } else {
      customPreferences[preferenceName] = null;
    }
  }

  // remember what was on the blacklists to determine what was consented by the user and what was overwritten
  customPreferences.tenantBlacklisted = tenantBlacklistedDestinationIds;
  customPreferences.roleBlacklisted = roleBlacklistedDestinationIds;

  return customPreferences;
}

function removeBlacklistedDestinations(destinations: IDestination[], blacklistedDestinationIds: string[]) {
  return destinations.filter(destination => !(blacklistedDestinationIds).includes(destination.id));
}

function getDestinationPreferences(customPreferences: CustomPreferences, remainingDestinations: IDestination[]) {
  const destinationPreferences = {};

  // for each non-blacklisted destination, set the preference for this destination to be
  // the preference the user set for the category it belongs to
  for (const destination of remainingDestinations) {
    if (ADVERTISING_CATEGORIES.find(c => c === destination.category)) {
      destinationPreferences[destination.id] = customPreferences.advertising;
    } else if (FUNCTIONAL_CATEGORIES.find(c => c === destination.category)) {
      destinationPreferences[destination.id] = customPreferences.functional;
    } else if (MARKETING_AND_ANALYTICS_CATEGORIES.find(c => c === destination.category)) {
      destinationPreferences[destination.id] = customPreferences.analytics;
    } else {
      // Fallback to marketing preference but send an error so we update the categories
      withScope(scope => {
        scope.setExtra('wrongDestination', destination.id);
        scope.setExtra('wrongDestinationCategory', destination.category);
        reportError('A segment destination doesn\'t belong to a category');
      });
      destinationPreferences[destination.id] =
        customPreferences.analytics;
    }
  }

  return destinationPreferences;
}

/** helper function
* put the blacklist in the format { destinationId: false }
**/
function formatBlacklistDestinations(blacklistedDestinationIds: string[] | null) {
  /** helper function
  * reducer function, when passed in to _array.reduce, transforms the array
  * into an object with the elements of the array as keys, and false as values
  **/
  const reducerArrayToObject = (acc, curr) => (acc[curr] = false, acc);

  return blacklistedDestinationIds ? blacklistedDestinationIds.reduce(reducerArrayToObject, {}) : {};
}

export class ConsentManager extends PureComponent<Props> {
  render() {
    const { tenant, authUser } = this.props;

    const isPrivilegedUser = !isNilOrError(authUser) && (isAdmin({ data: authUser }) || isModerator({ data: authUser }));
    const isSuperAdminUser = !isNilOrError(authUser) && isSuperAdmin({ data: authUser });
    const tenantBlacklistedDestinations = (!isNilOrError(tenant) ? tenant.attributes.settings.core.segment_destinations_blacklist : []) || [];
    const roleBlacklistedDestinations = !isPrivilegedUser ? adminIntegrations : isSuperAdminUser ? superAdminIntegrationsBl : [];
    if (!isNilOrError(tenant)) {
      return (
        <ConsentManagerBuilder
          writeKey={CL_SEGMENT_API_KEY}
          mapCustomPreferences={handleMapCustomPreferences(tenantBlacklistedDestinations, roleBlacklistedDestinations)}
          initialPreferences={initialPreferences}
          onError={reportToSegment}
          // shouldReload={true}
        >
          {(consentManagerProps: ConsentManagerProps) => (
            <ConsentManagerBuilderHandler
              {...consentManagerProps}
              tenantBlacklistedDestinationIds={tenantBlacklistedDestinations}
              roleBlacklistedDestinationIds={roleBlacklistedDestinations}
            />
          )}
        </ConsentManagerBuilder>
      );
    }

    return null;
  }
}

const Data = adopt<DataProps, InputProps>({
  tenant: <GetTenant />,
  authUser: <GetAuthUser />
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <ConsentManager {...inputProps} {...dataProps} />}
  </Data>
);
