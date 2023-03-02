import { useMutation, useQueryClient } from '@tanstack/react-query';
import fetcher from 'utils/cl-react-query/fetcher';
import eventsKeys from './keys';
import { IDeleteEventFileProperties } from './types';

const deleteEventFile = (properties: IDeleteEventFileProperties) =>
  fetcher({
    path: `/events/${properties.eventId}/files/${properties.fileId}`,
    action: 'delete',
  });

const useDeleteEventFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteEventFile,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: eventsKeys.all(),
      });
    },
  });
};

export default useDeleteEventFile;
