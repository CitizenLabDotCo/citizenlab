import React, { PureComponent } from 'react';
import { adopt } from 'react-adopt';
import { withScope } from '@sentry/browser';
import { isAdmin, isSuperAdmin, isModerator } from 'services/permissions/roles';

import {
  ADVERTISING_DESTINATIONS,
  FUNCTIONAL_DESTINATIONS,
  MARKETING_AND_ANALYTICS_DESTINATIONS,
  ADMIN_DESTINATIONS,
  IDestination,
  DESTINATIONS,
} from './destinations';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { reportError } from 'utils/loggingUtils';

// components

// resources
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';
import { Container } from './Container';
import GetFeatureFlag, {
  GetFeatureFlagChildProps,
} from 'resources/GetFeatureFlag';
import GetTenant, { GetTenantChildProps } from 'resources/GetTenant';
import { getConsent, setConsent } from './consent';

// the format in which the user will make its choices,
export interface IPreferences {
  analytics: boolean | undefined;
  advertising: boolean | undefined;
  functional: boolean | undefined;
}
// he format in which we'll save the consent

type ISavedDestinations = {
  [key in IDestination]?: boolean | undefined;
};
export interface IConsentCookie extends IPreferences {
  savedChoices: ISavedDestinations;
}

// the format in which we'll present the destinations to the user
export interface CategorizedDestinations {
  analytics: IDestination[];
  advertising: IDestination[];
  functional: IDestination[];
}

interface InputProps {}
interface DataProps {
  tenant: GetTenantChildProps;
  intercom: GetFeatureFlagChildProps;
  satismeter: GetFeatureFlagChildProps;
  google_analytics: GetFeatureFlagChildProps;
  authUser: GetAuthUserChildProps;
}
interface Props extends InputProps, DataProps {}

interface State {
  preferences: IPreferences;
  cookieConsent: IConsentCookie | null;
}

export class ConsentManager extends PureComponent<Props, State> {
  getActiveDestinations() {
    const { authUser } = this.props;

    const isPrivilegedUser =
      !isNilOrError(authUser) &&
      (isAdmin({ data: authUser }) || isModerator({ data: authUser }));

    const isSuperAdminUser =
      !isNilOrError(authUser) && isSuperAdmin({ data: authUser });

    const roleBlacklisted =
      !isPrivilegedUser || isSuperAdminUser ? ADMIN_DESTINATIONS : [];

    // for each destination
    return DESTINATIONS.map(
      (key) =>
        // if feature flag enabled
        this.props[key] &&
        // and role allows it
        !roleBlacklisted.includes(key) &&
        // add this key to the array
        key
      // filter out false values
    ).filter((el) => el) as IDestination[];
  }

  categorizeDestinations(destinations) {
    return {
      analytics: MARKETING_AND_ANALYTICS_DESTINATIONS.filter((destination) =>
        destinations.includes(destination)
      ),
      advertising: ADVERTISING_DESTINATIONS.filter((destination) =>
        destinations.includes(destination)
      ),
      functional: FUNCTIONAL_DESTINATIONS.filter((destination) =>
        destinations.includes(destination)
      ),
    };
  }

  getCurrentPreferences(cookieConsent) {
    const activeCategorizedDestinations = this.categorizeDestinations(
      this.getActiveDestinations()
    );

    if (!cookieConsent) {
      return {
        analytics: true,
        advertising: true,
        functional: true,
      };
    } else {
      const analyticsEnabled =
        // if it was disabled, it still is
        !cookieConsent.analytics
          ? false
          : // if there is a new destination
          activeCategorizedDestinations.analytics.find(
              (destination) =>
                cookieConsent.savedChoices[destination] === undefined
            )
          ? // then set to undefined
            undefined
          : // if it was enabled and there is no new destination, it's still enabled
            true;

      const advertisingEnabled = !cookieConsent.advertising
        ? false
        : activeCategorizedDestinations.advertising.find(
            (destination) =>
              cookieConsent.savedChoices[destination] === undefined
          )
        ? undefined
        : true;

      const functionalEnabled = !cookieConsent.functional
        ? false
        : activeCategorizedDestinations.functional.find(
            (destination) =>
              cookieConsent.savedChoices[destination] === undefined
          )
        ? undefined
        : true;

      return {
        analytics: analyticsEnabled,
        advertising: advertisingEnabled,
        functional: functionalEnabled,
      };
    }
  }

  constructor(props) {
    super(props);

    const cookieConsent = getConsent();

    this.state = {
      cookieConsent,
      preferences: this.getCurrentPreferences(cookieConsent),
    };
  }

  setPreferences = (changedPreference) => {
    this.setState((state) => ({
      ...state,
      preferences: { ...state.preferences, ...changedPreference },
    }));
  };

  saveConsent = () => {
    const { preferences, cookieConsent } = this.state;

    const activeCategorizedDestinations = this.categorizeDestinations(
      this.getActiveDestinations()
    );

    const analyicsDestinations = Object.fromEntries(
      activeCategorizedDestinations.analytics.map((destination) => [
        destination,
        preferences.analytics,
      ])
    ) as ISavedDestinations;

    setConsent({
      ...preferences,
      savedChoices: { ...cookieConsent?.savedChoices, ...analyicsDestinations },
    });
    this.setState({ cookieConsent: getConsent() });
  };

  render() {
    const { tenant } = this.props;
    const { preferences, cookieConsent } = this.state;

    const activeDestinations = this.getActiveDestinations();

    const activeCategorizedDestinations = this.categorizeDestinations(
      activeDestinations
    );

    const isConsentRequired =
      !cookieConsent ||
      !!activeDestinations.find(
        (destination) =>
          !Object.keys(cookieConsent?.savedChoices).includes(destination)
      );

    if (!isNilOrError(tenant)) {
      return (
        <Container
          setPreferences={this.setPreferences}
          saveConsent={this.saveConsent}
          isConsentRequired={isConsentRequired}
          preferences={preferences}
          categorizedDestinations={activeCategorizedDestinations}
        />
      );
    }

    return null;
  }
}

const Data = adopt<DataProps, InputProps>({
  tenant: <GetTenant />,
  intercom: <GetFeatureFlag name="intercom" />,
  satismeter: <GetFeatureFlag name="satismeter" />,
  google_analytics: <GetFeatureFlag name="google_analytics" />,
  authUser: <GetAuthUser />,
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => <ConsentManager {...inputProps} {...dataProps} />}
  </Data>
);
