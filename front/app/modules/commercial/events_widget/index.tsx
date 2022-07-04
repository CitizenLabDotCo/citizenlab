import React from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
import FeatureFlag from 'components/FeatureFlag';
import EventsWidget from './citizen';
import EventsWidgetSwitch from './admin/EventsWidgetSwitch';
import messages from './messages';
import SectionToggle from 'containers/Admin/pages-menu/SectionToggle';

const configuration: ModuleConfiguration = {
  outlets: {
    'app.containers.LandingPage.EventsWidget': () => (
      // Needs to be adjusted, events_widget_enabled
      // is not coming from appConfig anymore
      <FeatureFlag name="events_widget">
        <EventsWidget />
      </FeatureFlag>
    ),
    'app.containers.Admin.settings.customize.eventsSectionEnd': (props) => (
      // Needs to be adjusted, events_widget_enabled
      // is not coming from appConfig anymore
      <FeatureFlag name="events_widget" onlyCheckAllowed>
        <EventsWidgetSwitch {...props} />
      </FeatureFlag>
    ),
    'app.containers.Admin.flexible-pages.EditHomepage.sectionToggles': (
      props
    ) => {
      // still add new feature flag mechanism
      return (
        <SectionToggle
          onChangeSectionToggle={props.onChangeSectionToggle}
          titleMessageDescriptor={messages.eventsWidget}
          tooltipMessageDescriptor={messages.eventsWidgetTooltip}
        />
      );
    },
  },
};

export default configuration;
