import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { UserComponent } from '@craftjs/core';

import SharedEventsWidget from 'components/admin/ContentBuilder/Widgets/Events';

import EditModeHeightCap from '../EditModeHeightCap';
import messages from '../messages';

import EventsSettings from './Settings';

const EventsWidget: UserComponent = () => (
  <EditModeHeightCap>
    <Box my="40px">
      <SharedEventsWidget
        source="currentProject"
        timeFilters={['upcoming', 'past']}
        limit="all"
      />
    </Box>
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
