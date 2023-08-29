import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import eventsKeys from './keys';
import { EventsKeys, IEvent } from './types';

const fetchEvent = async ({ eventId }: { eventId?: string }) =>
  fetcher<IEvent>({
    path: `/events/${eventId}`,
    action: 'get',
  });

const useEvent = (eventId?: string) => {
  return useQuery<IEvent, CLErrors, IEvent, EventsKeys>({
    queryKey: eventsKeys.item({ id: eventId }),
    queryFn: () => fetchEvent({ eventId }),
    enabled: !!eventId,
  });
};

export default useEvent;
