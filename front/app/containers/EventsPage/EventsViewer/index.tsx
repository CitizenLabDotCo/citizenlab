import React, { memo } from 'react';

// components
import TopBar from './TopBar';
import EventsMessage from './EventsMessage';
import EventsSpinner from './EventsSpinner';
import EventCard from 'components/EventCard';
import Pagination from 'components/Pagination';

// i18n
import messages from '../messages';
import { MessageDescriptor } from 'utils/cl-intl';

// hooks
import useEvents from 'hooks/useEvents';
import { useBreakpoint } from '@citizenlab/cl2-component-library';

// styling
import styled from 'styled-components';

// other
import { isNilOrError, isNil, isError } from 'utils/helperUtils';

interface IStyledEventCard {
  last: boolean;
}

const StyledEventCard = styled(EventCard)<IStyledEventCard>`
  margin-bottom: ${({ last }) => (last ? 0 : 39)}px;
`;

const StyledPagination = styled(Pagination)`
  justify-content: center;
  margin: 36px auto 0px;
`;

interface Props {
  title: string;
  fallbackMessage: MessageDescriptor;
  eventsTime: 'past' | 'future';
  className?: string;
}

const EventsViewer = memo<Props>(
  ({ title, fallbackMessage, eventsTime, className }) => {
    const smallerThanMinTablet = useBreakpoint('smallTablet');

    const {
      events,
      currentPage,
      lastPage,
      onProjectIdsChange,
      onCurrentPageChange,
    } = useEvents({
      projectPublicationStatuses: ['published'],
      futureOnly: eventsTime === 'future',
      pastOnly: eventsTime === 'past',
      sort: eventsTime === 'past' ? 'newest' : 'oldest',
    });

    const eventsLoading = isNil(events);
    const eventsError = isError(events);

    return (
      <div className={className}>
        <TopBar title={title} setProjectIds={onProjectIdsChange} />

        {eventsError && (
          <EventsMessage message={messages.errorWhenFetchingEvents} />
        )}
        {eventsLoading && <EventsSpinner />}

        {!isNilOrError(events) && (
          <>
            {events.length > 0 &&
              events.map((event, i) => (
                <StyledEventCard
                  event={event}
                  showProjectTitle
                  onClickTitleGoToProjectAndScrollToEvent
                  showLocation
                  showDescription
                  showAttachments
                  verticalAttributes={smallerThanMinTablet}
                  last={events.length - 1 === i}
                  key={event.id}
                />
              ))}

            {events.length === 0 && <EventsMessage message={fallbackMessage} />}

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
