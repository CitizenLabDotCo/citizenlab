import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import eventsKeys from './keys';
import { IEvents, EventsKeys } from './types';

const fetchEvents = (attendeeId?: string) => {
  return fetcher<IEvents>({
    path: `/users/${attendeeId}/events`,
    action: 'get',
  });
};

const useEventsByUserId = (attendeeId?: string) => {
  return useQuery<IEvents, CLErrors, IEvents, EventsKeys>({
    queryKey: eventsKeys.list({ attendeeId }),
    queryFn: () => fetchEvents(attendeeId),
    enabled: !!attendeeId,
  });
};

export default useEventsByUserId;
