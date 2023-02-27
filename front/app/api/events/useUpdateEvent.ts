import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import eventsKeys from './keys';
import { IEvent, IUpdatedEventProperties } from './types';

type IUpdateEventObject = {
  id: string;
  requestBody: IUpdatedEventProperties;
};

const updateEvent = ({ id, requestBody }: IUpdateEventObject) =>
  fetcher<IEvent>({
    path: `/events/${id}`,
    action: 'patch',
    body: requestBody,
  });

const useUpdateEvent = () => {
  const queryClient = useQueryClient();
  return useMutation<IEvent, CLErrors, IUpdateEventObject>({
    mutationFn: updateEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventsKeys.lists() });
    },
  });
};

export default useUpdateEvent;
