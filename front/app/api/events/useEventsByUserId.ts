import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import eventsKeys from './keys';
import { IEvents, EventsKeys, InputParameters } from './types';

const fetchEvents = ({ attendeeId }: InputParameters) => {
  return fetcher<IEvents>({
    path: `/users/${attendeeId}/events`,
    action: 'get',
  });
};

const useEventsByUserId = ({ attendeeId }: InputParameters) => {
  const queryParams: InputParameters = {
    attendeeId,
  };

  return useQuery<IEvents, CLErrors, IEvents, EventsKeys>({
    queryKey: eventsKeys.list(queryParams),
    queryFn: () => fetchEvents(queryParams),
  });
};

export default useEventsByUserId;
