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
import moment from 'moment';

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
  flex: 0 0 48.8%;
`}

  ${media.phone`
  flex: 0 0 100%;
`}
`;

const StyledPagination = styled(Pagination)`
  justify-content: center;
  margin: 36px auto 0px;
`;

export type dateFilterKey = 'today' | 'week' | 'month' | 'all';

// Gets a time period from a given key (today, week, month) and
// returns it as a range of two values stored in an array
const getDatesFromKey = (dateFilter: dateFilterKey[] | undefined) => {
  if (!dateFilter) {
    return undefined;
  }

  if (dateFilter[0] === 'today') {
    return [
      moment().format('YYYY-MM-DD'),
      moment().add('1', 'day').format('YYYY-MM-DD'),
    ];
  } else if (dateFilter[0] === 'week') {
    return [
      moment().format('YYYY-MM-DD'),
      moment().add('8', 'day').format('YYYY-MM-DD'),
    ];
  } else if (dateFilter[0] === 'month') {
    return [
      moment().format('YYYY-MM-DD'),
      moment().add('1', 'month').add('1', 'day').format('YYYY-MM-DD'),
    ];
  }

  return undefined;
};

interface Props {
  title: string;
  fallbackMessage: MessageDescriptor;
  eventsTime: 'past' | 'currentAndFuture';
  className?: string;
  projectId?: string;
  hideSectionIfNoEvents?: boolean;
  showProjectFilter: boolean;
  showDateFilter?: boolean;
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
  showDateFilter = true,
}: Props) => {
  const [searchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);

  // Get any URL params
  const projectIdsParam = searchParams.get(
    eventsTime === 'past'
      ? 'past_events_project_ids'
      : 'ongoing_events_project_ids'
  );
  const dateParam =
    eventsTime === 'currentAndFuture' ? searchParams.get('time_period') : null;
  const projectIdsFromUrl: string[] = projectIdsParam
    ? JSON.parse(projectIdsParam)
    : null;
  const dateFilterFromUrl: dateFilterKey[] = dateParam
    ? JSON.parse(dateParam)
    : null;

  // Set state based on URL params
  const [projectIdList, setProjectIdList] = useState<string[] | undefined>(
    projectIdsFromUrl || (projectId ? [projectId] : [])
  );
  const [dateFilter, setDateFilter] = useState<dateFilterKey[] | undefined>(
    dateFilterFromUrl || []
  );

  const ongoingDuringDates = getDatesFromKey(dateFilter);

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
    ongoing_during: ongoingDuringDates,
  });

  useEffect(() => {
    if (projectId) {
      setProjectIdList([projectId]);
    }
  }, [projectId]);

  // Update projectIds URL params based on state, events time will not change after initial render
  useEffect(() => {
    const hasProjectFilter = projectIdList?.length;
    const eventParam =
      eventsTime === 'past'
        ? 'past_events_project_ids'
        : 'ongoing_events_project_ids';
    if (!location.pathname.includes('/projects')) {
      updateSearchParams({
        [eventParam]: hasProjectFilter ? projectIdList : null,
      });
    }
  }, [eventsTime, projectIdList]);

  // Update date filter URL params based on state, events time will not change after initial render
  useEffect(() => {
    const hasDateFilter = dateFilter?.length && dateFilter[0] !== 'all';
    if (eventsTime === 'currentAndFuture') {
      updateSearchParams({
        time_period: hasDateFilter ? dateFilter : null,
      });
    }
  }, [eventsTime, dateFilter]);

  const onCurrentPageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const lastPageNumber =
    (events && getPageNumberFromUrl(events.links?.last)) ?? 1;

  const shouldHideSection =
    (events && events.data.length === 0 && hideSectionIfNoEvents) ||
    (isLoading && hideSectionIfNoEvents) ||
    (isNilOrError(events) && hideSectionIfNoEvents);

  if (shouldHideSection) {
    return null;
  }

  return (
    <Box className={className} id="project-events">
      <TopBar
        showProjectFilter={showProjectFilter}
        title={title}
        setProjectIds={setProjectIdList}
        eventsTime={eventsTime}
        setDateFilter={setDateFilter}
        showDateFilter={showDateFilter}
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
