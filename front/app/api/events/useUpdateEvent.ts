import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import eventsKeys from './keys';
import { IEvent, IUpdateEventProperties } from './types';

const updateEvent = async ({ eventId, event }: IUpdateEventProperties) =>
  fetcher<IEvent>({
    path: `/events/${eventId}`,
    action: 'patch',
    body: { event },
  });

const useUpdateEvent = () => {
  const queryClient = useQueryClient();
  return useMutation<IEvent, CLErrors, IUpdateEventProperties>({
    mutationFn: updateEvent,
    onSuccess: (result) => {
      queryClient.invalidateQueries({
        queryKey: eventsKeys.item({ id: result.data.id }),
      });
      queryClient.invalidateQueries({ queryKey: eventsKeys.lists() });
    },
  });
};

export default useUpdateEvent;
