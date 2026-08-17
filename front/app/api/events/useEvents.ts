import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';
import queryOptions from 'utils/cl-react-query/queryOptions';

import eventsKeys from './keys';
import { IEvents, EventsKeys, InputParameters } from './types';

const fetchEvents = (filters: InputParameters) => {
  const {
    projectIds: project_ids,
    endsBeforeDate: ends_before_date,
    endsOnOrAfterDate: ends_on_or_after_date,
    sort,
    pageNumber,
    pageSize,
    projectPublicationStatuses: project_publication_statuses,
    staticPageId: static_page_id,
    attendeeId: attendee_id,
    ongoing_during,
    show_unlisted_events_user_can_moderate,
  } = filters;
  return fetcher<IEvents>({
    path: '/events',
    action: 'get',
    queryParams: {
      project_ids,
      ends_before_date,
      ends_on_or_after_date,
      static_page_id,
      sort,
      'page[number]': pageNumber,
      'page[size]': pageSize,
      project_publication_statuses,
      attendee_id,
      ongoing_during:
        ongoing_during && `[${ongoing_during[0]}, ${ongoing_during[1]}]`,
      show_unlisted_events_user_can_moderate,
    },
  });
};

// Module scope, so every caller in a session derives the same date and lands on
// the same query key. Recomputing it per call would give a hook and a loader
// two different keys for the same list.
const newDate = new Date().toJSON();

export const eventsOptions = ({
  projectIds,
  staticPageId,
  currentAndFutureOnly,
  pastOnly,
  pageSize,
  sort,
  projectPublicationStatuses,
  pageNumber,
  attendeeId,
  ongoing_during,
  show_unlisted_events_user_can_moderate,
}: InputParameters) => {
  const queryParams: InputParameters = {
    projectPublicationStatuses,
    sort: sort || (currentAndFutureOnly ? 'start_at' : '-start_at'),
    endsOnOrAfterDate: currentAndFutureOnly ? newDate : undefined,
    endsBeforeDate: pastOnly ? newDate : undefined,
    pageNumber,
    pageSize,
    projectIds,
    staticPageId,
    attendeeId,
    ongoing_during,
    show_unlisted_events_user_can_moderate,
  };

  return queryOptions<IEvents, EventsKeys>({
    queryKey: eventsKeys.list(queryParams),
    queryFn: () => fetchEvents(queryParams),
  });
};

const useEvents = (parameters: InputParameters, { enabled = true } = {}) => {
  return useQuery<IEvents, CLErrors, IEvents, EventsKeys>({
    ...eventsOptions(parameters),
    enabled,
  });
};

export default useEvents;
