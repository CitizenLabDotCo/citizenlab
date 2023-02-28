import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import eventsKeys from './keys';
import { IEvents, EventsKeys } from './types';

const fetchEvents = () => fetcher<IEvents>({ path: '/events', action: 'get' });

const useEvents = () => {
  return useQuery<IEvents, CLErrors, IEvents, EventsKeys>({
    queryKey: eventsKeys.lists(),
    queryFn: fetchEvents,
  });
};

export default useEvents;
