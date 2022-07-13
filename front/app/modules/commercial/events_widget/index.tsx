import React from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
import useHomepageSettingsFeatureFlag from 'hooks/useHomepageSettingsFeatureFlag';
import useFeatureFlag from 'hooks/useFeatureFlag';
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
    'app.containers.Admin.settings.customize.eventsSectionEnd': (props) => {
      const featureFlag = useFeatureFlag({
        name: 'events_widget',
        onlyCheckAllowed: true,
      });

      if (featureFlag) {
        return <EventsWidgetSwitch {...props} />;
      }

      return null;
    },
  },
};

export default configuration;
