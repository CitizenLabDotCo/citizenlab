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
} from './categories';

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

// the format in which the user will make its choices,
export interface IPreferences {
  analytics: boolean | null;
  advertising: boolean | null;
  functional: boolean | null;
}
// he format in which we'll save the consent

type SavedDestinations = {
  [key in IDestination]?: boolean | null;
};
export interface CookieFormat extends SavedDestinations {
  tenantBlacklisted?: string[] | undefined;
  roleBlacklisted?: string[] | undefined;
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
}

export class ConsentManager extends PureComponent<Props, State> {
  getRoleBlacklist() {
    const { authUser } = this.props;

    const isPrivilegedUser =
      !isNilOrError(authUser) &&
      (isAdmin({ data: authUser }) || isModerator({ data: authUser }));

    const isSuperAdminUser =
      !isNilOrError(authUser) && isSuperAdmin({ data: authUser });

    return !isPrivilegedUser || isSuperAdminUser ? ADMIN_DESTINATIONS : [];
  }

  getTenantBlacklist() {
    return MARKETING_AND_ANALYTICS_DESTINATIONS.concat(ADVERTISING_DESTINATIONS)
      .concat(FUNCTIONAL_DESTINATIONS)
      .map((key) => !this.props[key] && key)
      .filter((el) => el) as IDestination[];
  }

  render() {
    const { tenant } = this.props;
    const { preferences } = this.state;

    const roleBlacklisted = this.getRoleBlacklist();
    const tenantBlacklisted = this.getTenantBlacklist();

    const categorizedDestinations = {
      analytics: MARKETING_AND_ANALYTICS_DESTINATIONS.filter(
        (destination) =>
          tenantBlacklisted.includes(destination) ||
          roleBlacklisted.includes(destination)
      ),
      advertising: ADVERTISING_DESTINATIONS.filter(
        (destination) =>
          tenantBlacklisted.includes(destination) ||
          roleBlacklisted.includes(destination)
      ),
      functional: FUNCTIONAL_DESTINATIONS.filter(
        (destination) =>
          tenantBlacklisted.includes(destination) ||
          roleBlacklisted.includes(destination)
      ),
    };

    if (!isNilOrError(tenant)) {
      return (
        <Container
          setPreferences={setPreferences}
          resetPreferences={resetPreferences}
          saveConsent={saveConsent}
          isConsentRequired={isConsentRequired}
          preferences={preferences}
          categorizedDestinations={categorizedDestinations}
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
