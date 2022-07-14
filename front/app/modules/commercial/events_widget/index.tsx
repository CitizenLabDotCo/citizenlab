import React from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
import useHomepageSettingsFeatureFlag from 'hooks/useHomepageSettingsFeatureFlag';
import useFeatureFlag from 'hooks/useFeatureFlag';
import EventsWidget from './citizen';
import EventsWidgetSwitch from './admin/EventsWidgetSwitch';
import messages from './messages';
import SectionToggle, {
  Props as SectionToggleProps,
} from 'containers/Admin/pages-menu/SectionToggle';
import {
  IHomepageSettingsAttributes,
  THomepageSection,
} from 'services/homepageSettings';

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
    'app.containers.Admin.flexible-pages.EditHomepage.sectionToggles': ({
      homepageSettingsAttributes,
      onChangeSectionToggle,
      ...otherProps
    }) => {
      // still add new feature flag mechanism
      return (
        <SectionToggle
          titleMessageDescriptor={messages.eventsWidget}
          tooltipMessageDescriptor={messages.eventsWidgetTooltip}
          checked={homepageSettingsAttributes['events_widget_enabled']}
          onChangeSectionToggle={onChangeSectionToggle('events_widget')}
          {...otherProps}
        />
      );
    },
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

declare module 'utils/moduleUtils' {
  export interface OutletsPropertyMap {
    'app.containers.Admin.flexible-pages.EditHomepage.sectionToggles': Pick<
      SectionToggleProps,
      'disabled'
    > & {
      onChangeSectionToggle: (
        sectionName: THomepageSection
      ) => () => Promise<void>;
      homepageSettingsAttributes: IHomepageSettingsAttributes;
    };
  }
}
