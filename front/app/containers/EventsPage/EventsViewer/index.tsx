import React, { useEffect, useState } from 'react';

// components
import TopBar from './TopBar';
import EventsMessage from './EventsMessage';
import EventsSpinner from './EventsSpinner';
import EventCard from 'components/EventCard';
import Pagination from 'components/Pagination';
import { Box, media } from '@citizenlab/cl2-component-library';

// i18n
import messages from '../messages';
import { MessageDescriptor } from 'react-intl';

// hooks
import useEvents from 'api/events/useEvents';

// styling
import styled from 'styled-components';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { getPageNumberFromUrl } from 'utils/paginationUtils';

// types
import { PublicationStatus } from 'api/projects/types';

// router
import { useSearchParams } from 'react-router-dom';
import { updateSearchParams } from 'utils/cl-router/updateSearchParams';

interface IStyledEventCard {
  last: boolean;
}

const StyledEventCard = styled(EventCard)<IStyledEventCard>`
  flex: 0 0 32.3%;

  ${media.tablet`
  flex: 0 0 48.6%;
  `}

  ${media.phone`
  flex: 0 0 100%;
  `}
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
  projectId?: string;
  hideSectionIfNoEvents?: boolean;
  showProjectFilter: boolean;
  projectPublicationStatuses: PublicationStatus[];
  attendeeId?: string;
}

const EventsViewer = ({
  title,
  fallbackMessage,
  eventsTime,
  className,
  projectId,
  hideSectionIfNoEvents,
  showProjectFilter,
  projectPublicationStatuses,
  attendeeId,
}: Props) => {
  const [searchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);
  const projectIdsParam =
    eventsTime === 'past'
      ? searchParams.get('past_events_project_ids')
      : searchParams.get('ongoing_events_project_ids');
  const projectIdsFromUrl: string[] = projectIdsParam
    ? JSON.parse(projectIdsParam)
    : null;
  const [projectIdList, setProjectIdList] = useState<string[] | undefined>(
    projectIdsFromUrl || (projectId ? [projectId] : [])
  );

  useEffect(() => {
    if (projectId) {
      setProjectIdList([projectId]);
    }
  }, [projectId]);

  useEffect(() => {
    if (!location.pathname.includes('/projects')) {
      if (eventsTime === 'past') {
        projectIdList?.length
          ? updateSearchParams({ past_events_project_ids: projectIdList })
          : updateSearchParams({ past_events_project_ids: null });
      } else if (eventsTime === 'currentAndFuture') {
        projectIdList?.length
          ? updateSearchParams({ ongoing_events_project_ids: projectIdList })
          : updateSearchParams({ ongoing_events_project_ids: null });
      }
    }
  }, [eventsTime, projectIdList]);

  const {
    data: events,
    isLoading,
    isError,
  } = useEvents({
    projectIds: projectIdList,
    projectPublicationStatuses,
    currentAndFutureOnly: eventsTime === 'currentAndFuture',
    pastOnly: eventsTime === 'past',
    sort: eventsTime === 'past' ? 'start_at' : '-start_at',
    pageNumber: currentPage,
    attendeeId,
  });
  const lastPageNumber =
    (events && getPageNumberFromUrl(events.links?.last)) ?? 1;

  const shouldHideSection =
    (events && events.data.length === 0 && hideSectionIfNoEvents) ||
    (isLoading && hideSectionIfNoEvents) ||
    (isNilOrError(events) && hideSectionIfNoEvents);

  if (shouldHideSection) {
    return null;
  }
  const onCurrentPageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  return (
    <Box className={className} id="project-events">
      <TopBar
        showProjectFilter={showProjectFilter}
        title={title}
        setProjectIds={setProjectIdList}
        eventsTime={eventsTime}
      />

      {isError && <EventsMessage message={messages.errorWhenFetchingEvents} />}

      {isLoading && <EventsSpinner />}

      {!isNilOrError(events) && (
        <>
          <Box display="flex" flexWrap="wrap" gap="16px">
            {events.data.length > 0 &&
              events.data.map((event, i) => (
                <StyledEventCard
                  id={event.id}
                  event={event}
                  last={events.data.length - 1 === i}
                  key={event.id}
                />
              ))}
          </Box>

          {events.data.length === 0 && (
            <EventsMessage message={fallbackMessage} />
          )}

          <StyledPagination
            currentPage={currentPage}
            totalPages={lastPageNumber}
            loadPage={onCurrentPageChange}
            useColorsTheme
          />
        </>
      )}
    </Box>
  );
};

export default EventsViewer;
