import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { UserComponent } from '@craftjs/core';

import { maxPageWidth } from 'containers/ProjectsShowPage/styles';

import useCraftComponentDefaultPadding from 'components/admin/ContentBuilder/useCraftComponentDefaultPadding';
import SharedEventsWidget from 'components/admin/ContentBuilder/Widgets/Events';

import EditModeHeightCap from '../EditModeHeightCap';
import messages from '../messages';

import EventsSettings from './Settings';

const EventsWidget: UserComponent = () => {
  const padding = useCraftComponentDefaultPadding();

  return (
    <SharedEventsWidget
      source="currentProject"
      timeFilters={['upcoming', 'past']}
      limit="all"
      renderFrame={(contents) => (
        <EditModeHeightCap>
          <Box mx="auto" my="40px" maxWidth={`${maxPageWidth}px`} px={padding}>
            {contents}
          </Box>
        </EditModeHeightCap>
      )}
    />
  );
};

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
