import { useMutation, useQueryClient } from '@tanstack/react-query';
import fetcher from 'utils/cl-react-query/fetcher';
import eventImagesKeys from './keys';
import eventsKeys from 'api/events/keys';

const deleteEventImage = ({
  eventId,
  imageId,
}: {
  eventId: string;
  imageId: string;
}) =>
  fetcher({
    path: `/events/${eventId}/images/${imageId}`,
    action: 'delete',
  });

const useDeleteEventImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteEventImage,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: eventImagesKeys.list({
          eventId: variables.eventId,
        }),
      });
      queryClient.invalidateQueries({
        queryKey: eventsKeys.item({
          id: variables.eventId,
        }),
      });
    },
  });
};

export default useDeleteEventImage;
