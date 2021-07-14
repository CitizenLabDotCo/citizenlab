import React, { memo } from 'react';

// components
import TopBar from './TopBar';
import EventsError from './EventsError';
import EventsSpinner from './EventsSpinner';
import EventCard from 'components/EventCard';
import Pagination from 'components/Pagination';

// svg
import noEventsIllustration from './NoEventsPicture.svg';

// hooks
import useEvents from 'hooks/useEvents';

// styling
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';

// other
import { isNilOrError, isNil, isError } from 'utils/helperUtils';

interface IStyledEventCard {
  last: boolean;
}

const StyledEventCard = styled(EventCard)<IStyledEventCard>`
  margin-bottom: ${({ last }) => (last ? 0 : 39)}px;
`;

const NoEventsContainer = styled.figure`
  position: relative;
  width: 100%;
  margin: 78px 0px 216px;
`;

const NoEventsIllustration = styled.img`
  width: 345px;
  height: 286px;
  display: block;
  margin: 0px auto;
`;

const NoEventsText = styled.figcaption`
  margin: 37px auto 0px;
  text-align: center;
  color: ${colors.label};
  font-size: ${fontSizes.xl}px;
`;

const StyledPagination = styled(Pagination)`
  justify-content: center;
  margin: 36px auto 0px;
`;

interface Props {
  title: string;
  fallbackMessage: string;
  eventsTime: 'past' | 'future';
  className?: string;
}

const EventsViewer = memo<Props>(
  ({ title, fallbackMessage, eventsTime, className }) => {
    const {
      events,
      currentPage,
      lastPage,
      onProjectIdsChange,
      onCurrentPageChange,
    } = useEvents({
      futureOnly: eventsTime === 'future',
      pastOnly: eventsTime === 'past',
    });

    const eventsLoading = isNil(events);
    const eventsError = isError(events);

    return (
      <div className={className}>
        <TopBar title={title} setProjectIds={onProjectIdsChange} />

        {eventsError && <EventsError />}
        {eventsLoading && <EventsSpinner />}

        {!isNilOrError(events) && (
          <>
            {events.length > 0 &&
              events.map((event, i) => (
                <StyledEventCard
                  event={event}
                  showProjectTitle
                  showLocation
                  showDescription
                  last={events.length - 1 === i}
                  key={event.id}
                />
              ))}

            {events.length === 0 && (
              <NoEventsContainer>
                <NoEventsIllustration src={noEventsIllustration} />
                <NoEventsText>{fallbackMessage}</NoEventsText>
              </NoEventsContainer>
            )}

            <StyledPagination
              currentPage={currentPage}
              totalPages={lastPage}
              loadPage={onCurrentPageChange}
              useColorsTheme
            />
          </>
        )}
      </div>
    );
  }
);

export default EventsViewer;
