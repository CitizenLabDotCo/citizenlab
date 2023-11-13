import React from 'react';

// components
import { Box, colors, useBreakpoint } from '@citizenlab/cl2-component-library';

// hooks
import messages from '../../../messages';
import EventsWidget from 'components/LandingPages/citizen/EventsWidget';

const Events = () => {
  const isSmallerThanTablet = useBreakpoint('tablet');
  return (
    <Box bg={colors.background}>
      <Box
        maxWidth="1150px"
        margin="0 auto"
        pt={isSmallerThanTablet ? '20px' : '40px'}
        pb={isSmallerThanTablet ? '20px' : '40px'}
        px={isSmallerThanTablet ? '20px' : '0px'}
      >
        <EventsWidget />
      </Box>
    </Box>
  );
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
