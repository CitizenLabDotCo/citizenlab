import React, { memo, useEffect } from 'react';

// components
import TopBar from './TopBar';
import EventsMessage from './EventsMessage';
import EventsSpinner from './EventsSpinner';
import EventCard from 'components/EventCard';
import Pagination from 'components/Pagination';

// i18n
import messages from '../messages';
import { MessageDescriptor } from 'react-intl';

// hooks
import useEvents from 'api/events/useEvents';

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
  eventsTime: 'past' | 'currentAndFuture';
  className?: string;
  projectIds?: string[];
  onClickTitleGoToProjectAndScrollToEvent?: boolean;
  hideSectionIfNoEvents?: boolean;
  showProjectFilter: boolean;
}

const EventsViewer = memo<Props>(
  ({
    title,
    fallbackMessage,
    eventsTime,
    className,
    projectIds,
    onClickTitleGoToProjectAndScrollToEvent,
    hideSectionIfNoEvents,
    showProjectFilter,
  }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const {
      events,
      currentPage,
      lastPage,
      onProjectIdsChange,
      onCurrentPageChange,
    } = useEvents({
      projectIds,
      projectPublicationStatuses: ['published'],
      currentAndFutureOnly: eventsTime === 'currentAndFuture',
      pastOnly: eventsTime === 'past',
      sort: eventsTime === 'past' ? 'newest' : 'oldest',
      pageNumber: currentPage,
    });

    useEffect(() => {
      if (!isNilOrError(projectIds)) {
        onProjectIdsChange(projectIds);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [projectIds]);

    const eventsLoading = isNil(events);
    const eventsError = isError(events);

    const shouldHideSection =
      (!isNilOrError(events) && events.length === 0 && hideSectionIfNoEvents) ||
      (eventsLoading && hideSectionIfNoEvents) ||
      (isNilOrError(events) && hideSectionIfNoEvents);

    if (shouldHideSection) {
      return null;
    }
    const onCurrentPageChange = (newPage: number) => {
      setCurrentPage(newPage);
    };

    return (
      <div className={className}>
        <TopBar
          showProjectFilter={showProjectFilter}
          title={title}
          setProjectIds={onProjectIdsChange}
        />

        {eventsError && (
          <EventsMessage message={messages.errorWhenFetchingEvents} />
        )}

        {eventsLoading && <EventsSpinner />}

        {!isNilOrError(events) && (
          <>
            {events.length > 0 &&
              events.map((event, i) => (
                <StyledEventCard
                  id={event.id}
                  event={event}
                  showProjectTitle
                  onClickTitleGoToProjectAndScrollToEvent={
                    onClickTitleGoToProjectAndScrollToEvent
                  }
                  showLocation
                  showDescription
                  showAttachments
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
