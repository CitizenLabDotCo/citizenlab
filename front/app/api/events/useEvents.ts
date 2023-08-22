import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
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
    ongoing_between,
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
      ongoing_between,
    },
  });
};

const newDate = new Date().toJSON();

const useEvents = ({
  projectIds,
  staticPageId,
  currentAndFutureOnly,
  pastOnly,
  pageSize,
  sort,
  projectPublicationStatuses,
  pageNumber,
  attendeeId,
  ongoing_between,
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
    ongoing_between,
  };

  return useQuery<IEvents, CLErrors, IEvents, EventsKeys>({
    queryKey: eventsKeys.list(queryParams),
    queryFn: () => fetchEvents(queryParams),
  });
};

export default useEvents;
