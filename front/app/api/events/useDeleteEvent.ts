import { useMutation, useQueryClient } from '@tanstack/react-query';
import fetcher from 'utils/cl-react-query/fetcher';
import eventsKeys from './keys';

const deleteEvent = (id: string) =>
  fetcher({
    path: `/events/${id}`,
    action: 'delete',
  });

const useDeleteEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: eventsKeys.lists(),
      });
    },
  });
};

export default useDeleteEvent;
