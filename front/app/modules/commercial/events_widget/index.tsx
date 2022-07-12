import React from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
import FeatureFlag from 'components/FeatureFlag';
import useHomepageSettingsFeatureFlag from 'hooks/useHomepageSettingsFeatureFlag';
import EventsWidget from './citizen';
import EventsWidgetSwitch from './admin/EventsWidgetSwitch';

const configuration: ModuleConfiguration = {
  outlets: {
    'app.containers.LandingPage.EventsWidget': () => {
      const featureFlag = useHomepageSettingsFeatureFlag({
        homepageEnabledSetting: 'events_widget_enabled',
        appConfigSettingName: 'events_widget',
      });

      if (featureFlag) {
        return (
          // Needs to be adjusted, events_widget_enabled
          // is not coming from appConfig anymore
          <FeatureFlag name="events_widget">
            <EventsWidget />
          </FeatureFlag>
        );
      }

      return null;
    },
    'app.containers.Admin.settings.customize.eventsSectionEnd': (props) => (
      // Needs to be adjusted, events_widget_enabled
      // is not coming from appConfig anymore
      <FeatureFlag name="events_widget" onlyCheckAllowed>
        <EventsWidgetSwitch {...props} />
      </FeatureFlag>
    ),
  },
};

export default configuration;
