import React from 'react';

import { Box, media } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { IEvents } from 'api/events/types';

import EventCard from 'components/EventCards/EventCard';

const StyledEventCard = styled(EventCard)`
  flex: 0 0 32.3%;

  ${media.tablet`
    flex: 0 0 48.8%;
  `}

  ${media.phone`
    flex: 0 0 100%;
  `}
`;

interface Props {
  events: IEvents;
}

const EventCards = ({ events }: Props) => {
  return (
    <Box display="flex" flexWrap="wrap" gap="16px" as="ul" px="0px">
      {events.data.length > 0 &&
        events.data.map((event) => (
          <StyledEventCard id={event.id} event={event} key={event.id} />
        ))}
    </Box>
  );
};

export default EventCards;
