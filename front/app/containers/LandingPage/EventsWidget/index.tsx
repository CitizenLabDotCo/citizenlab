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

const CardsContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;

  > * {
    margin: 0px 19px;
  }
  > :first-child {
    margin-left: 0px;
  }
  > :last-child {
    margin-right: 0px;
  }
`;

const StyledEventCard = styled(EventCard)`
  border-radius: 3px;
  padding: 20px;

  > div > div > h3 > span {
    font-size: 18px;
  }
`;

export default () => {
  const { events } = useEvents({
    futureOnly: true,
    pageSize: 3,
  });

  return (
    <EventsWidgetContainer>
      <TopBar />

      {!isNilOrError(events) && (
        <CardsContainer>
          {events.map((event) => (
            <StyledEventCard
              event={event}
              key={event.id}
              showProjectTitle
              clickable
            />
          ))}
        </CardsContainer>
      )}
    </EventsWidgetContainer>
  );
};
