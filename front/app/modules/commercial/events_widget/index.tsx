import React from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
import useHomepageSettingsFeatureFlag from 'hooks/useHomepageSettingsFeatureFlag';
import EventsWidget from './citizen';
import SectionToggle, {
  Props as SectionToggleProps,
} from './admin/SectionToggle';

const RenderOnFeatureFlag = ({ children }) => {
  const featureFlag = useHomepageSettingsFeatureFlag({
    sectionEnabledSettingName: 'events_widget_enabled',
    appConfigSettingName: 'events_widget',
  });

  return featureFlag ? <>{children}</> : null;
};

const configuration: ModuleConfiguration = {
  outlets: {
    'app.containers.Admin.flexible-pages.EditHomepage.sectionToggles': (
      props
    ) => {
      return (
        <RenderOnFeatureFlag>
          <SectionToggle {...props} />
        </RenderOnFeatureFlag>
      );
    },
    'app.containers.LandingPage.EventsWidget': () => {
      return (
        <RenderOnFeatureFlag>
          <EventsWidget />
        </RenderOnFeatureFlag>
      );
    },
  },
};

export default configuration;

declare module 'utils/moduleUtils' {
  export interface OutletsPropertyMap {
    'app.containers.Admin.flexible-pages.EditHomepage.sectionToggles': SectionToggleProps;
  }
}
