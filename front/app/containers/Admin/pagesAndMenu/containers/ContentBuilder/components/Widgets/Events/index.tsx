import React from 'react';

import { Box, useBreakpoint, Text } from '@citizenlab/cl2-component-library';

import { DEFAULT_PADDING } from 'components/admin/ContentBuilder/constants';
import SharedEventsWidget from 'components/admin/ContentBuilder/Widgets/Events';

import { useIntl } from 'utils/cl-intl';

import { DEFAULT_Y_PADDING } from '../constants';

import messages from './messages';

const Events = () => {
  const isSmallerThanTablet = useBreakpoint('tablet');
  return (
    <Box data-cy="e2e-events">
      <Box
        maxWidth="1200px"
        margin="0 auto"
        pt={isSmallerThanTablet ? DEFAULT_PADDING : DEFAULT_Y_PADDING}
        pb={isSmallerThanTablet ? DEFAULT_PADDING : DEFAULT_Y_PADDING}
        px={isSmallerThanTablet ? DEFAULT_PADDING : '0px'}
      >
        <SharedEventsWidget
          source="all"
          timeFilters={['upcoming']}
          limit={3}
          projectPublicationStatuses={['published']}
          showEmptyMessage
        />
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
};

export const eventsTitle = messages.eventsTitle;

export default Events;
