import React from 'react';

import { Box, media } from '@citizenlab/cl2-component-library';
import styled, { css } from 'styled-components';

import { IEvents } from 'api/events/types';

import EventCard from 'components/EventCards/EventCard';

// The basis subtracts the 16px gaps the list sets between cards. A plain percentage leaves
// them unaccounted for, so the last card of a row wraps once the container is narrow
// enough — as it is in the content builder canvas.
export const cardColumn = css`
  flex: 0 0 calc((100% - 2 * 16px) / 3);

  ${media.tablet`
    flex: 0 0 calc((100% - 16px) / 2);
  `}

  ${media.phone`
    flex: 0 0 100%;
  `}
`;

const StyledEventCard = styled(EventCard)`
  ${cardColumn}
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
