import React from 'react';

// components
import { Box } from '@citizenlab/cl2-component-library';

// hooks
import messages from '../../../messages';
import EventsWidget from 'components/LandingPages/citizen/EventsWidget';

const Events = () => {
  return <EventsWidget />;
};

const EventsSettings = () => {
  return (
    <Box
      background="#ffffff"
      my="40px"
      display="flex"
      flexDirection="column"
      gap="16px"
    />
  );
};

Events.craft = {
  related: {
    settings: EventsSettings,
  },
  custom: {
    title: messages.eventsTitle,
    noPointerEvents: true,
  },
};

export default Events;
