import { useMutation, useQueryClient } from '@tanstack/react-query';
import { omit } from 'lodash-es';
import { CLErrors } from 'typings';

import eventsKeys from 'api/events/keys';

import fetcher from 'utils/cl-react-query/fetcher';

import eventsAttendancesKeys from './keys';
import { IAddEventAttendanceProperties, IEventAttendance } from './types';

export const addEventAttendance = async (
  requestBody: IAddEventAttendanceProperties
) => {
  return fetcher<IEventAttendance>({
    path: `/events/${requestBody.eventId}/attendances`,
    action: 'post',
    body: { attendance: omit(requestBody, 'eventId') },
  });
};

const useAddEventAttendance = (eventId: string) => {
  const queryClient = useQueryClient();
  return useMutation<IEventAttendance, CLErrors, IAddEventAttendanceProperties>(
    {
      mutationFn: addEventAttendance,
      onSuccess: (_data, params) => {
        queryClient.invalidateQueries({
          queryKey: eventsAttendancesKeys.list({ eventId }),
        });
        queryClient.invalidateQueries({
          queryKey: eventsKeys.item({ id: eventId }),
        });
        queryClient.invalidateQueries({
          queryKey: eventsKeys.list({}),
        });
        if (params.attendeeId) {
          queryClient.invalidateQueries({
            queryKey: eventsKeys.list({ attendeeId: params.attendeeId }),
          });
        }
      },
    }
  );
};

export default useAddEventAttendance;
