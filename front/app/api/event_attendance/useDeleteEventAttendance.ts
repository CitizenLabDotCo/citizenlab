import { useMutation, useQueryClient } from '@tanstack/react-query';
import fetcher from 'utils/cl-react-query/fetcher';
import { IDeleteEventAttendanceProperties } from './types';
import eventsAttendancesKeys from './keys';

const deleteEventAttendance = (properties: IDeleteEventAttendanceProperties) =>
  fetcher({
    path: `/event_attendances/${properties.attendanceId}`,
    action: 'delete',
  });

const useDeleteEventAttendance = (eventId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteEventAttendance,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: eventsAttendancesKeys.list({ eventId }),
      });
    },
  });
};

export default useDeleteEventAttendance;
