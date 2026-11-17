import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import eventsAttendancesKeys from './keys';
import {
  IEventAttendances,
  EventAttendanceKeys,
  InputParameters,
} from './types';

const fetchEventAttendances = ({
  eventId,
  ...queryParams
}: InputParameters) => {
  return fetcher<IEventAttendances>({
    path: `/events/${eventId}/attendances`,
    action: 'get',
    queryParams,
  });
};

const useEventAttendances = (
  eventId?: string,
  parameters: Omit<InputParameters, 'eventId'> = {}
) => {
  const queryParameters = { eventId, ...parameters };
  return useQuery<
    IEventAttendances,
    CLErrors,
    IEventAttendances,
    EventAttendanceKeys
  >({
    queryKey: eventsAttendancesKeys.list(queryParameters),
    queryFn: () => fetchEventAttendances(queryParameters),
    enabled: !!eventId,
    staleTime: 0,
  });
};

export default useEventAttendances;
