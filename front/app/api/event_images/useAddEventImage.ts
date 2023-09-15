import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import { IEventImage, AddEventImageObject } from './types';
import eventImagesKeys from './keys';

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
          eventId: variables.eventId,
        }),
      });
    },
  });
};

export default useAddEventImage;
