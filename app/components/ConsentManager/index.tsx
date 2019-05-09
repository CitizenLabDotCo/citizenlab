import React, { PureComponent } from 'react';
import { ConsentManagerBuilder } from '@segment/consent-manager';
import { CL_SEGMENT_API_KEY } from 'containers/App/constants';
import { integrations } from 'utils/analytics';

import Container from './Container';

import { ADVERTISING_CATEGORIES, FUNCTIONAL_CATEGORIES } from './categories';
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';

export interface IDestination {
  id: string;
  name: string;
  description: string;
  website: string;
  category: string;
}
export interface CustomPreferences {
  analytics: boolean | null;
  advertising: boolean | null;
  functional: boolean | null;
}
const initialPreferences = {
  analytics: null,
  advertising: null,
  functional: null
};

interface InputProps {}
interface DataProps {
  authUser: GetAuthUserChildProps;
}
interface Props extends InputProps, DataProps {}

export const mapCustomPreferences = ({ destinations, preferences }) => {
  const destinationPreferences = {};
  const customPreferences = {} as CustomPreferences;

  // Default unset preferences to true (for implicit consent)
  for (const preferenceName of Object.keys(preferences)) {
    const value = preferences[preferenceName];
    if (typeof value === 'boolean') {
      customPreferences[preferenceName] = value;
    } else {
      customPreferences[preferenceName] = true;
    }
  }

  for (const destination of destinations) {
    if (ADVERTISING_CATEGORIES.find(c => c === destination.category)) {
      destinationPreferences[destination.id] = customPreferences.advertising;
    } else if (FUNCTIONAL_CATEGORIES.find(c => c === destination.category)) {
      destinationPreferences[destination.id] = customPreferences.functional;
    } else {
      // Fallback to marketing
      destinationPreferences[destination.id] =
        customPreferences.analytics;
    }
  }

  return {
    destinationPreferences,
    customPreferences,
  };
};

export class ConsentManager extends PureComponent<Props> {

  handleMapCustomPreferences = ({ destinations, preferences }) => {
    const { destinationPreferences, customPreferences } = mapCustomPreferences({ destinations, preferences });

    // We don't want to send everything to all destinations, depending on the user role
    const { authUser } = this.props;
    const guardedDestinationPreferences = integrations((authUser && { data: authUser }) || null);

    return {
      customPreferences,
      destinationPreferences: { ...destinationPreferences, ...guardedDestinationPreferences } };
  }

  render() {
    return (
      <ConsentManagerBuilder
        writeKey={CL_SEGMENT_API_KEY}
        mapCustomPreferences={this.handleMapCustomPreferences}
        initialPreferences={initialPreferences}
      >
        {(ConsentManagerProps) => (
          <Container {...ConsentManagerProps} />
        )}
      </ConsentManagerBuilder>
    );
  }
}

export default () => (
  <GetAuthUser>
    {(authUser) => <ConsentManager authUser={authUser} />}
  </GetAuthUser>
);
