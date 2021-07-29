import React from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
import FeatureFlag from 'components/FeatureFlag';
import EventsWidget from './citizen';

const configuration: ModuleConfiguration = {
  outlets: {
    'app.containers.LandingPage.EventsWidget': () => (
      <FeatureFlag name="events_widget">
        <EventsWidget />
      </FeatureFlag>
    ),
  },
};

export default configuration;
