import React, { PureComponent } from 'react';
import { ConsentManagerBuilder } from '@segment/consent-manager';
import { CL_SEGMENT_API_KEY } from 'containers/App/constants';
import Container from './Container';

import { ADVERTISING_CATEGORIES, FUNCTIONAL_CATEGORIES } from './categories';

export default class ConsentManager extends PureComponent {
  render() {
    return (
      <ConsentManagerBuilder
        writeKey={CL_SEGMENT_API_KEY}
        mapCustomPreferences={this.handleMapCustomPreferences}
      >
        {(ConsentManagerProps) => (
          <Container {...ConsentManagerProps} />
        )}
      </ConsentManagerBuilder>
    );
  }

  handleMapCustomPreferences = ({ destinations, preferences }) => {
    const destinationPreferences = {};
    const customPreferences = {} as any;

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
          customPreferences.marketingAndAnalytics;
      }
    }

    return { destinationPreferences, customPreferences };
  }
}
