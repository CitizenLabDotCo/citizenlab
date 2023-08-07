import { useMutation, useQueryClient } from '@tanstack/react-query';
import { omit } from 'lodash-es';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import eventsAttendancesKeys from './keys';
import { IAddEventAttendanceProperties, IEventAttendance } from './types';

const addEventAttendance = async (
  requestBody: IAddEventAttendanceProperties
) => {
  return fetcher<IEventAttendance>({
    path: `/events/${requestBody.eventId}/attendances`,
    action: 'post',
    body: { attendance: omit(requestBody, 'eventId') },
  });
};

const useAddEventAttendance = () => {
  const queryClient = useQueryClient();
  return useMutation<IEventAttendance, CLErrors, IAddEventAttendanceProperties>(
    {
      mutationFn: addEventAttendance,
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: eventsAttendancesKeys.lists(),
        });
      },
    }
  );
};

export default useAddEventAttendance;
