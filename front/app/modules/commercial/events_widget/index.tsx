import React from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
import useHomepageSettingsFeatureFlag from 'hooks/useHomepageSettingsFeatureFlag';
import useFeatureFlag from 'hooks/useFeatureFlag';
import EventsWidget from './citizen';
import EventsWidgetSwitch from './admin/EventsWidgetSwitch';

const RenderOnFeatureFlag = ({ children }) => {
  const featureFlag = useHomepageSettingsFeatureFlag({
    sectionEnabledSettingName: 'events_widget_enabled',
    appConfigSettingName: 'events_widget',
  });

  return featureFlag ? <>{children}</> : null;
};

const RenderOnAllowed = ({ children }) => {
  const allowed = useFeatureFlag({
    name: 'events_widget',
    onlyCheckAllowed: true,
  });

  return allowed ? <>{children}</> : null;
};

const configuration: ModuleConfiguration = {
  outlets: {
    'app.containers.LandingPage.EventsWidget': () => {
      return (
        <RenderOnFeatureFlag>
          <EventsWidget />
        </RenderOnFeatureFlag>
      );
    },
    'app.containers.Admin.settings.customize.eventsSectionEnd': (props) => {
      return (
        <RenderOnAllowed>
          <EventsWidgetSwitch {...props} />
        </RenderOnAllowed>
      );
    },
  },
};

export default configuration;
