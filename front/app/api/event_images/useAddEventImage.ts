import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import eventsKeys from 'api/events/keys';

import fetcher from 'utils/cl-react-query/fetcher';

import eventImagesKeys from './keys';
import { IEventImage, AddEventImageObject } from './types';

const addEventImage = async ({
  eventId,
  ...requestBody
}: AddEventImageObject) =>
  fetcher<IEventImage>({
    path: `/events/${eventId}/images`,
    action: 'post',
    body: requestBody,
  });

const useAddEventImage = () => {
  const queryClient = useQueryClient();
  return useMutation<IEventImage, CLErrors, AddEventImageObject>({
    mutationFn: addEventImage,
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

export default useAddEventImage;
