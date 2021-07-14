import React from 'react';

// components
import TopBar from './TopBar';
import EventCard from 'components/EventCard';

// hooks
import useEvents from 'hooks/useEvents';

// styling
import styled from 'styled-components';

// other
import { isNilOrError } from 'utils/helperUtils';

const EventsWidgetContainer = styled.div`
  padding: 48px 0 124px 0;
`;

export default () => {
  const { events } = useEvents({
    futureOnly: true,
    pageSize: 3,
  });

  return (
    <EventsWidgetContainer>
      <TopBar />

      {!isNilOrError(events) &&
        events.map((event) => {
          return <EventCard event={event} key={event.id} />;
        })}
    </EventsWidgetContainer>
  );
};
