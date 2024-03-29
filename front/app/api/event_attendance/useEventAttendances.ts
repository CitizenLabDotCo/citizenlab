import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';
import { isNilOrError } from 'utils/helperUtils';

import eventsAttendancesKeys from './keys';
import { IEventAttendances, EventAttendanceKeys } from './types';

const fetchEventAttendances = (eventId: string) => {
  return fetcher<IEventAttendances>({
    path: `/events/${eventId}/attendances`,
    action: 'get',
  });
};

const useEventAttendances = (eventId: string) => {
  return useQuery<
    IEventAttendances,
    CLErrors,
    IEventAttendances,
    EventAttendanceKeys
  >({
    queryKey: eventsAttendancesKeys.list({ eventId }),
    queryFn: () => fetchEventAttendances(eventId),
    enabled: !isNilOrError(eventId),
  });
};

export default useEventAttendances;
