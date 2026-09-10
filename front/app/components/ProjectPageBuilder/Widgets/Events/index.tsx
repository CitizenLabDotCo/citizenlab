import React from 'react';

import { UserComponent } from '@craftjs/core';

import SharedEventsWidget from 'components/admin/ContentBuilder/Widgets/Events';

import EditModeHeightCap from '../EditModeHeightCap';
import messages from '../messages';

import EventsSettings from './Settings';

const EventsWidget: UserComponent = () => (
  <EditModeHeightCap>
    <SharedEventsWidget
      source="currentProject"
      timeFilters={['upcoming', 'past']}
      limit="all"
    />
  </EditModeHeightCap>
);

EventsWidget.craft = {
  related: {
    settings: EventsSettings,
  },
  custom: {
    title: messages.eventsWidgetTitle,
    noPointerEvents: true,
  },
};

export default EventsWidget;
