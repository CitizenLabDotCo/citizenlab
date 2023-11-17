import React from 'react';

// components
import { Box, colors, useBreakpoint } from '@citizenlab/cl2-component-library';

// hooks
import messages from '../../../messages';
import EventsWidget from 'components/LandingPages/citizen/EventsWidget';
import { DEFAULT_PADDING } from 'components/admin/ContentBuilder/constants';

const Events = () => {
  const isSmallerThanTablet = useBreakpoint('tablet');
  return (
    <Box bg={colors.background}>
      <Box
        maxWidth="1150px"
        margin="0 auto"
        pt={isSmallerThanTablet ? DEFAULT_PADDING : '40px'}
        pb={isSmallerThanTablet ? DEFAULT_PADDING : '40px'}
        px={isSmallerThanTablet ? DEFAULT_PADDING : '0px'}
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
