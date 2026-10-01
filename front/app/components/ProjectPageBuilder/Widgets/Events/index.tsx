import React from 'react';

import { UserComponent } from '@craftjs/core';

import SharedEventsWidget from 'components/admin/ContentBuilder/Widgets/Events';

import messages from '../messages';

import EventsSettings from './Settings';

const EventsWidget: UserComponent = () => (
  <SharedEventsWidget
    source="currentProject"
    timeFilters={['upcoming', 'past']}
    limit="all"
  />
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
