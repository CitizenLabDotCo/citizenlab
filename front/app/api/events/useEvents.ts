import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import eventsKeys from './keys';
import { IEvents, EventsKeys, InputParameters, QueryParameters } from './types';

const fetchEvents = ({
  // TODO: replace params with one object
  project_ids,
  ends_before_date,
  ends_on_or_after_date,
  sort,
  'page[number]': pageNumber,
  'page[size]': pageSize,
  project_publication_statuses,
}: QueryParameters) =>
  fetcher<IEvents>({
    path: '/events',
    action: 'get',
    queryParams: {
      project_ids,
      ends_before_date,
      ends_on_or_after_date,
      sort,
      'page[number]': pageNumber,
      'page[size]': pageSize,
      project_publication_statuses,
    },
  });

// ToDo: type project id and static page id, currentAndFutureOnly
const useEvents = ({
  projectIds,
  staticPageId,
  currentAndFutureOnly,
  pastOnly,
  pageSize,
  // sort,
  projectPublicationStatuses,
  pageNumber,
}: InputParameters) => {
  const queryParams: QueryParameters = {
    ...(projectIds && { project_ids: projectIds }),
    ...(staticPageId && {
      static_page_id: staticPageId,
    }),
  };
  if (projectPublicationStatuses) {
    queryParams.project_publication_statuses = projectPublicationStatuses;
  }

  if (currentAndFutureOnly) {
    queryParams.ends_on_or_after_date = new Date().toJSON();
    queryParams.sort = 'start_at';
  }

  if (pastOnly) {
    queryParams.ends_before_date = new Date().toJSON();
    queryParams.sort = '-start_at';
  }

  if (pageNumber) {
    queryParams['page[number]'] = pageNumber;
  }

  if (pageSize) {
    queryParams['page[size]'] = pageSize;
  }

  return useQuery<IEvents, CLErrors, IEvents, EventsKeys>({
    queryKey: eventsKeys.lists(),
    queryFn: () => fetchEvents(queryParams),
  });
};

export default useEvents;
