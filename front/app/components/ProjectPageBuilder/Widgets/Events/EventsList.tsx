import React from 'react';

import { Box, Text, colors } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { IEventData } from 'api/events/types';

import EventCard from 'components/EventCards/EventCard';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../messages';

// Sized by the container, not the viewport: cards are at least ~400px wide and
// wrap into as many columns as fit, so the widget adapts to wherever it is
// placed on the page.
const Grid = styled.ul`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 400px), 1fr));
  gap: 16px;
  list-style: none;
  padding: 0;
  margin: 0;
`;

const PastBadge = () => (
  <Box
    display="inline-block"
    px="8px"
    py="2px"
    bgColor={colors.grey200}
    borderRadius="3px"
  >
    <Text m="0px" fontSize="xs" fontWeight="bold" color="coolGrey700">
      <FormattedMessage {...messages.pastEventBadge} />
    </Text>
  </Box>
);

type Props = {
  upcomingEvents: IEventData[];
  pastEvents: IEventData[];
};

const EventsList = ({ upcomingEvents, pastEvents }: Props) => (
  <Grid>
    {upcomingEvents.map((event) => (
      <EventCard key={event.id} id={event.id} event={event} />
    ))}
    {pastEvents.map((event) => (
      <EventCard
        key={event.id}
        id={event.id}
        event={event}
        badge={<PastBadge />}
      />
    ))}
  </Grid>
);

export default EventsList;
