import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import eventsKeys from './keys';
import { IAddEventProperties, IEvent } from './types';

const addEvent = async (requestBody: IAddEventProperties) => {
  return fetcher<IEvent>({
    path: `/projects/${requestBody.projectId}/events`,
    action: 'post',
    body: { event: requestBody.event },
  });
};

const useAddEvent = () => {
  const queryClient = useQueryClient();
  return useMutation<IEvent, CLErrors, IAddEventProperties>({
    mutationFn: addEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventsKeys.lists() });
    },
  });
};

export default useAddEvent;
