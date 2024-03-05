import React, { useEffect, useState } from 'react';

import { Box, media } from '@citizenlab/cl2-component-library';
import moment from 'moment';
import { MessageDescriptor } from 'react-intl';
import { useSearchParams } from 'react-router-dom';
import styled from 'styled-components';

import useEvents from 'api/events/useEvents';
import { PublicationStatus } from 'api/projects/types';

import EventCard from 'components/EventCard';
import Pagination from 'components/Pagination';

import { updateSearchParams } from 'utils/cl-router/updateSearchParams';
import { isNilOrError } from 'utils/helperUtils';
import { getPageNumberFromUrl } from 'utils/paginationUtils';

import messages from '../messages';

import EventsMessage from './EventsMessage';
import EventsSpinner from './EventsSpinner';
import TopBar from './TopBar';

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
  showProjectFilter,
  projectPublicationStatuses,
  attendeeId,
  showDateFilter = true,
}: Props) => {
  const [searchParams] = useSearchParams();

  // Get any URL params
  const projectIdsParam = searchParams.get(
    eventsTime === 'past'
      ? 'past_events_project_ids'
      : 'ongoing_events_project_ids'
  );
  const pageNumberParam = searchParams.get(
    eventsTime === 'past' ? 'past_page' : 'ongoing_page'
  );
  const dateParam =
    eventsTime === 'currentAndFuture' ? searchParams.get('time_period') : null;
  const projectIdsFromUrl: string[] = projectIdsParam
    ? JSON.parse(projectIdsParam)
    : null;
  const dateFilterFromUrl: dateFilterKey[] = dateParam
    ? JSON.parse(dateParam)
    : null;
  const pageNumberFromUrl: number | null = pageNumberParam
    ? JSON.parse(pageNumberParam)
    : null;

  // Set state based on URL params
  const [projectIdList, setProjectIdList] = useState<string[] | undefined>(
    projectIdsFromUrl || (projectId ? [projectId] : [])
  );
  const [dateFilter, setDateFilter] = useState<dateFilterKey[]>(
    dateFilterFromUrl || []
  );

  const [currentPage, setCurrentPage] = useState(pageNumberFromUrl || 1);

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
    pageSize: 15,
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

  // Update pageNumber URL param based on state, events time will not change after initial render
  useEffect(() => {
    const eventParam = eventsTime === 'past' ? 'past_page' : 'ongoing_page';
    updateSearchParams({
      [eventParam]: currentPage > 1 ? currentPage : null,
    });
  }, [eventsTime, currentPage]);

  // Update date filter URL params based on state, events time will not change after initial render
  useEffect(() => {
    const hasDateFilter =
      dateFilter.length > 0 ? dateFilter[0] !== 'all' : false;
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
