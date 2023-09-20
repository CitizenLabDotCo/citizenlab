import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import { EventImagesKeys, IEventImage } from './types';
import eventImagesKeys from './keys';
import { IEventData } from 'api/events/types';

const fetchEventImage = ({
  eventId,
  imageId,
}: {
  eventId?: string;
  imageId?: string;
}) =>
  fetcher<IEventImage>({
    path: `/events/${eventId}/images/${imageId}`,
    action: 'get',
  });

const useEventImage = (event: IEventData | undefined) => {
  const eventId = event?.id;
  const imageId = event?.relationships?.event_images?.data?.[0]?.id;
  return useQuery<IEventImage, CLErrors, IEventImage, EventImagesKeys>({
    queryKey: eventImagesKeys.item({ eventId, imageId }),
    queryFn: () => fetchEventImage({ eventId, imageId }),
    enabled: !!eventId && !!imageId,
  });
};

export default useEventImage;
