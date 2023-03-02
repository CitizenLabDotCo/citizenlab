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
}: InputParameters) => {
  const queryParams: QueryParameters = {
    project_publication_statuses: projectPublicationStatuses,
    sort: currentAndFutureOnly ? 'start_at' : pastOnly ? '-start_at' : sort,
    ends_on_or_after_date: currentAndFutureOnly ? newDate : undefined,
    ends_before_date: pastOnly ? newDate : undefined,
    pageNumber,
    pageSize,
    ...(projectIds && { project_ids: projectIds }),
    ...(staticPageId && {
      static_page_id: staticPageId,
    }),
  };

  return useQuery<IEvents, CLErrors, IEvents, EventsKeys>({
    queryKey: eventsKeys.list({ filters: queryParams }),
    queryFn: () => fetchEvents({ filters: queryParams }),
  });
};

export default useEvents;
