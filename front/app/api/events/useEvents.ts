import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import eventsKeys from './keys';
import { IEvents, EventsKeys, InputParameters, QueryParameters } from './types';

type Props = {
  filters: QueryParameters;
};

const fetchEvents = ({ filters }: Props) => {
  const {
    project_ids,
    ends_before_date,
    ends_on_or_after_date,
    sort,
    pageNumber,
    pageSize,
    project_publication_statuses,
  } = filters;
  return fetcher<IEvents>({
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
};

const useEvents = ({
  projectIds,
  staticPageId,
  currentAndFutureOnly,
  pastOnly,
  pageSize,
  sort,
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
    queryParams[pageNumber] = pageNumber;
  }

  if (sort) {
    queryParams[sort] = sort;
  }

  if (pageSize) {
    queryParams[pageSize] = pageSize;
  }

  return useQuery<IEvents, CLErrors, IEvents, EventsKeys>({
    queryKey: eventsKeys.list({ filters: queryParams }),
    queryFn: () => fetchEvents({ filters: queryParams }),
  });
};

export default useEvents;
