import React, { useEffect } from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { UserComponent } from '@craftjs/core';

import { maxPageWidth } from 'containers/ProjectsShowPage/styles';

import useCraftComponentDefaultPadding from 'components/admin/ContentBuilder/useCraftComponentDefaultPadding';
import SharedEventsWidget from 'components/admin/ContentBuilder/Widgets/Events';

import { useLocation } from 'utils/router';
import { scrollToElement } from 'utils/scroll';

import EditModeHeightCap from '../EditModeHeightCap';
import messages from '../messages';

import EventsSettings from './Settings';

export const EVENTS_WIDGET_ANCHOR_ID = 'e2e-project-page-events';

const EventsWidget: UserComponent = () => {
  const { hash } = useLocation();
  const padding = useCraftComponentDefaultPadding();

  useEffect(() => {
    if (hash === EVENTS_WIDGET_ANCHOR_ID) {
      scrollToElement({ id: EVENTS_WIDGET_ANCHOR_ID });
    }
  }, [hash]);

  return (
    <SharedEventsWidget
      source="currentProject"
      timeFilters={['upcoming', 'past']}
      limit="all"
      renderFrame={(contents) => (
        <EditModeHeightCap>
          <Box
            id={EVENTS_WIDGET_ANCHOR_ID}
            mx="auto"
            my="40px"
            maxWidth={`${maxPageWidth}px`}
            px={padding}
          >
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
