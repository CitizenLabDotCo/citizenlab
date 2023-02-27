import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import eventsKeys from './keys';
import { IEvent, IUpdatedEventProperties } from './types';

const addEvent = async (requestBody: IUpdatedEventProperties) =>
  fetcher<IEvent>({
    path: '/events',
    action: 'post',
    body: requestBody,
  });

const useAddEvent = () => {
  const queryClient = useQueryClient();
  return useMutation<IEvent, CLErrors, IUpdatedEventProperties>({
    mutationFn: addEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventsKeys.all() });
    },
  });
};

export default useAddEvent;
