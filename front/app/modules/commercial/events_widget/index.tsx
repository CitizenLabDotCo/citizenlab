import React from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
import FeatureFlag from 'components/FeatureFlag';
import EventsWidget from './citizen';
import EventsWidgetSwitch from './admin/EventsWidgetSwitch';

const configuration: ModuleConfiguration = {
  outlets: {
    'app.containers.LandingPage.EventsWidget': () => (
      <FeatureFlag name="events_widget">
        <EventsWidget />
      </FeatureFlag>
    ),
    'app.containers.Admin.settings.customize.EventsWidgetSwitch': (props) => (
      <EventsWidgetSwitch {...props} />
    ),
  },
};

export default configuration;
