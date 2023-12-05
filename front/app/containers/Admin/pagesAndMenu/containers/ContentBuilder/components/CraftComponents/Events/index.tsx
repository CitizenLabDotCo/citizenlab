import React from 'react';

// components
import {
  Box,
  colors,
  useBreakpoint,
  Text,
} from '@citizenlab/cl2-component-library';

// hooks
import messages from './messages';
import EventsWidget from 'components/LandingPages/citizen/EventsWidget';
import { useIntl } from 'utils/cl-intl';
import { DEFAULT_PADDING } from 'components/admin/ContentBuilder/constants';

const Events = () => {
  const isSmallerThanTablet = useBreakpoint('tablet');
  return (
    <Box bg={colors.background} data-cy="e2e-events">
      <Box
        maxWidth="1200px"
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
  const { formatMessage } = useIntl();
  return (
    <Box
      background="#ffffff"
      my="20px"
      display="flex"
      flexDirection="column"
      gap="16px"
    >
      <Text color="textSecondary">
        {formatMessage(messages.eventsDescription)}
      </Text>
    </Box>
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
