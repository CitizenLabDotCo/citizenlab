import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import { EventImagesKeys, IEventImage } from './types';
import eventImagesKeys from './keys';

const fetchEventImage = ({
  eventId,
  imageId,
}: {
  eventId: string;
  imageId?: string;
}) =>
  fetcher<IEventImage>({
    path: `/events/${eventId}/images/${imageId}`,
    action: 'get',
  });

const useEventImage = (eventId: string, imageId?: string) => {
  return useQuery<IEventImage, CLErrors, IEventImage, EventImagesKeys>({
    queryKey: eventImagesKeys.item({ eventId, imageId }),
    queryFn: () => fetchEventImage({ eventId, imageId }),
    enabled: !!imageId,
  });
};

export default useEventImage;
