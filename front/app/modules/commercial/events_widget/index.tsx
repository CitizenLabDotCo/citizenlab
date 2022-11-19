import React from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
import useHomepageSettingsFeatureFlag from 'hooks/useHomepageSettingsFeatureFlag';
const EventsWidget = React.lazy(() => import('./citizen'));
import SectionToggle, {
  Props as SectionToggleProps,
} from './admin/SectionToggle';
import useFeatureFlag from 'hooks/useFeatureFlag';

// The events section toggle should be rendered if the customer is Allowed to use the feature
const RenderOnFeatureAllowed = ({ children }) => {
  const allowed = useFeatureFlag({
    name: 'events_widget',
    onlyCheckAllowed: true,
  });

  return allowed ? <>{children}</> : null;
};

// The events section on the front page should be shown
// if the customer is Allowed (appConfig) and if the feature is Enabled (homePageSettings)
const RenderOnAllowedAndEnabled = ({ children }) => {
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
        <RenderOnFeatureAllowed>
          <SectionToggle {...props} />
        </RenderOnFeatureAllowed>
      );
    },
    'app.containers.HomePage.EventsWidget': () => {
      return (
        <RenderOnAllowedAndEnabled>
          <EventsWidget />
        </RenderOnAllowedAndEnabled>
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
