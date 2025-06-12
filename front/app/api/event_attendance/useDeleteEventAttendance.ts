import { useMutation, useQueryClient } from '@tanstack/react-query';

import eventsKeys from 'api/events/keys';

import fetcher from 'utils/cl-react-query/fetcher';

import eventsAttendancesKeys from './keys';
import { IDeleteEventAttendanceProperties } from './types';

const deleteEventAttendance = (properties: IDeleteEventAttendanceProperties) =>
  fetcher({
    path: `/event_attendances/${properties.attendanceId}`,
    action: 'delete',
  });

const useDeleteEventAttendance = (eventId: string, userId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteEventAttendance,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: eventsAttendancesKeys.list({ eventId }),
      });
      queryClient.invalidateQueries({
        queryKey: eventsKeys.item({ id: eventId }),
      });
      queryClient.invalidateQueries({
        queryKey: eventsKeys.list({}),
      });
      if (userId) {
        queryClient.invalidateQueries({
          queryKey: eventsKeys.list({ attendeeId: userId }),
        });
      }
    },
  });
};

export default useDeleteEventAttendance;
