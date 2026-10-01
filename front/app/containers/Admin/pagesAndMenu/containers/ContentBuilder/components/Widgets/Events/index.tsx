import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';

import SharedEventsWidget from 'components/admin/ContentBuilder/Widgets/Events';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

const Events = () => (
  <Box data-cy="e2e-events">
    <SharedEventsWidget
      source="all"
      timeFilters={['upcoming']}
      limit={3}
      projectPublicationStatuses={['published']}
      showEmptyMessage
    />
  </Box>
);

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
