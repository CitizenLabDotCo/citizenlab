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
        return <EventsWidget />;
      }

      return null;
    },
    'app.containers.Admin.settings.customize.eventsSectionEnd': (props) => (
      <FeatureFlag name="events_widget" onlyCheckAllowed>
        <EventsWidgetSwitch {...props} />
      </FeatureFlag>
    ),
  },
};

export default configuration;
