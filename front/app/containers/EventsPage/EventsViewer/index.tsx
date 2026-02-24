import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { useSearch } from '@tanstack/react-router';
import moment from 'moment';
import { MessageDescriptor } from 'react-intl';
import styled from 'styled-components';

import useEvents from 'api/events/useEvents';
import { PublicationStatus } from 'api/projects/types';

import EventCards from 'components/EventCards';
import Pagination from 'components/Pagination';

import { ScreenReaderOnly } from 'utils/a11y';
import { useIntl } from 'utils/cl-intl';
import { updateSearchParams } from 'utils/cl-router/updateSearchParams';
import { isNilOrError } from 'utils/helperUtils';
import { getPageNumberFromUrl } from 'utils/paginationUtils';

import messages from '../messages';

import EventsMessage from './EventsMessage';
import EventsSpinner from './EventsSpinner';
import TopBar from './TopBar';

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
  const {
    ongoing_events_project_ids,
    past_events_project_ids,
    ongoing_page,
    past_page,
    time_period,
  } = useSearch({ strict: false });
  const { formatMessage } = useIntl();

  const projectIdList = projectId
    ? [projectId]
    : (eventsTime === 'past'
        ? past_events_project_ids
        : ongoing_events_project_ids) ?? [];

  const dateFilter: dateFilterKey[] = time_period ?? [];
  const currentPage = (eventsTime === 'past' ? past_page : ongoing_page) ?? 1;

  const ongoingDuringDates = getDatesFromKey(dateFilter);

  const {
    data: events,
    isLoading,
    isError,
  } = useEvents({
    projectIds: projectIdList.length > 0 ? projectIdList : undefined,
    projectPublicationStatuses,
    currentAndFutureOnly: eventsTime === 'currentAndFuture',
    pastOnly: eventsTime === 'past',
    sort: eventsTime === 'past' ? 'start_at' : '-start_at',
    pageNumber: currentPage,
    pageSize: 15,
    attendeeId,
    ongoing_during: ongoingDuringDates,
  });

  const handleProjectIdsChange = (ids: string[]) => {
    if (!location.pathname.includes('/projects')) {
      const eventParam =
        eventsTime === 'past'
          ? 'past_events_project_ids'
          : 'ongoing_events_project_ids';
      updateSearchParams({
        [eventParam]: ids.length > 0 ? ids : null,
      });
    }
  };

  const handleDateFilterChange = (filter: dateFilterKey[]) => {
    if (eventsTime === 'currentAndFuture') {
      const hasDateFilter = filter.length > 0 ? filter[0] !== 'all' : false;
      updateSearchParams({
        time_period: hasDateFilter ? filter : null,
      });
    }
  };

  const handlePageChange = (newPage: number) => {
    const eventParam = eventsTime === 'past' ? 'past_page' : 'ongoing_page';
    updateSearchParams({
      [eventParam]: newPage > 1 ? newPage : null,
    });
  };

  const lastPageNumber =
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    (events && getPageNumberFromUrl(events.links?.last)) ?? 1;

  return (
    <Box className={className}>
      <TopBar
        showProjectFilter={showProjectFilter}
        title={title}
        setProjectIds={handleProjectIdsChange}
        eventsTime={eventsTime}
        setDateFilter={handleDateFilterChange}
        showDateFilter={showDateFilter}
        dateFilter={dateFilter}
      />
      {isError && <EventsMessage message={messages.errorWhenFetchingEvents} />}
      {isLoading && <EventsSpinner />}
      {!isNilOrError(events) && (
        <>
          <EventCards events={events} />

          <ScreenReaderOnly aria-live="assertive">
            {formatMessage(messages.a11y_eventsHaveChanged1, {
              numberOfEvents: events.data.length,
            })}
          </ScreenReaderOnly>

          {events.data.length === 0 && (
            <EventsMessage message={fallbackMessage} />
          )}

          <StyledPagination
            currentPage={currentPage}
            totalPages={lastPageNumber}
            loadPage={handlePageChange}
            useColorsTheme
          />
        </>
      )}
    </Box>
  );
};

export default EventsViewer;
