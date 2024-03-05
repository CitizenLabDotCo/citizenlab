import { useMutation, useQueryClient } from '@tanstack/react-query';

import eventsKeys from 'api/events/keys';

import fetcher from 'utils/cl-react-query/fetcher';

import eventImagesKeys from './keys';

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
          id: variables.eventId,
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
