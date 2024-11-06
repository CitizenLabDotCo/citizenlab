import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import eventsKeys from 'api/events/keys';

import fetcher from 'utils/cl-react-query/fetcher';

import eventImagesKeys from './keys';
import { IEventImage, UpdateEventImageObject } from './types';

const updateEventImage = async ({
  eventId,
  imageId,
  ...requestBody
}: UpdateEventImageObject) =>
  fetcher<IEventImage>({
    path: `/events/${eventId}/images/${imageId}`,
    action: 'patch',
    body: requestBody,
  });

const useUpdateEventImage = () => {
  const queryClient = useQueryClient();
  return useMutation<IEventImage, CLErrors, UpdateEventImageObject>({
    mutationFn: updateEventImage,
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

export default useUpdateEventImage;
