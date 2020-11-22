import React, { PureComponent } from 'react';
import { adopt } from 'react-adopt';
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

// components

// resources
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';
import Container from './Container';
import GetTenant, { GetTenantChildProps } from 'resources/GetTenant';
import { getConsent, setConsent } from './consent';
import { get } from 'lodash-es';

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
  authUser: GetAuthUserChildProps;
}
interface Props extends InputProps, DataProps {}

interface State {
  preferences: IPreferences;
  cookieConsent: IConsentCookie | null;
}

export class ConsentManager extends PureComponent<Props, State> {
  getActiveDestinations() {
    const { authUser, tenant } = this.props;
    if (isNilOrError(tenant)) return [];

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
        get(tenant.attributes.settings, `${key}.allowed`) === true &&
        get(tenant.attributes.settings, `${key}.enabled`) === true &&
        // for GTM, if there is active destinations
        (key === 'google_tag_manager'
          ? !!tenant.attributes.settings?.google_tag_manager?.destinations
          : true) &&
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

    if (
      !cookieConsent ||
      Object.values(cookieConsent).every((el) => el === undefined)
    ) {
      return {
        analytics: undefined,
        advertising: undefined,
        functional: undefined,
      };
    } else {
      const analyticsEnabled =
        // if it was enabled
        cookieConsent.analytics && // if there is a new destination
        activeCategorizedDestinations.analytics.find(
          (destination) => cookieConsent.savedChoices[destination] === undefined
        )
          ? // then set to undefined
            undefined
          : // otherwise leave it as is
            cookieConsent.analytics;
      const advertisingEnabled =
        cookieConsent.advertising &&
        activeCategorizedDestinations.advertising.find(
          (destination) => cookieConsent.savedChoices[destination] === undefined
        )
          ? undefined
          : cookieConsent.advertising;

      const functionalEnabled =
        cookieConsent.functional &&
        activeCategorizedDestinations.functional.find(
          (destination) => cookieConsent.savedChoices[destination] === undefined
        )
          ? undefined
          : cookieConsent.functional;

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

  resetPreferences = () => {
    this.setState((state) => ({
      ...state,
      preferences: this.getCurrentPreferences(state.cookieConsent),
    }));
  };

  saveConsent = () => {
    const { preferences, cookieConsent } = this.state;

    const activeCategorizedDestinations = this.categorizeDestinations(
      this.getActiveDestinations()
    );

    // Object.fromEntries is not yet supported by node, so replaced with a reduce
    const analyicsDestinations = activeCategorizedDestinations.analytics
      .map((destination) => [destination, preferences.analytics])
      .reduce(
        (a, [k, v]) => ({ ...a, [k as string]: v }),
        {}
      ) as ISavedDestinations;

    const advertisingDestinations = activeCategorizedDestinations.advertising
      .map((destination) => [destination, preferences.advertising])
      .reduce(
        (a, [k, v]) => ({ ...a, [k as string]: v }),
        {}
      ) as ISavedDestinations;

    const functionalDestinations = activeCategorizedDestinations.functional
      .map((destination) => [destination, preferences.functional])
      .reduce(
        (a, [k, v]) => ({ ...a, [k as string]: v }),
        {}
      ) as ISavedDestinations;

    setConsent({
      ...preferences,
      savedChoices: {
        ...cookieConsent?.savedChoices,
        ...analyicsDestinations,
        ...advertisingDestinations,
        ...functionalDestinations,
      },
    });
    this.setState({ cookieConsent: getConsent() });
  };

  accept = () => {
    this.setState(
      (state) => ({
        ...state,
        preferences: {
          ...state.preferences,
          ...(state.preferences.analytics === undefined
            ? { analytics: true }
            : {}),
          ...(state.preferences.advertising === undefined
            ? { advertising: true }
            : {}),
          ...(state.preferences.functional === undefined
            ? { functional: true }
            : {}),
        },
      }),
      () => this.saveConsent()
    );
  };

  render() {
    const { tenant, authUser } = this.props;
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

    if (!isNilOrError(tenant) && authUser !== undefined) {
      return (
        <Container
          accept={this.accept}
          setPreferences={this.setPreferences}
          resetPreferences={this.resetPreferences}
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
  authUser: <GetAuthUser />,
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => <ConsentManager {...inputProps} {...dataProps} />}
  </Data>
);
