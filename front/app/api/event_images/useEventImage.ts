import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import { IEventData } from 'api/events/types';

import fetcher from 'utils/cl-react-query/fetcher';

import eventImagesKeys from './keys';
import { EventImagesKeys, IEventImage } from './types';

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
  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const imageId = event?.relationships?.event_images?.data?.[0]?.id;
  return useQuery<IEventImage, CLErrors, IEventImage, EventImagesKeys>({
    queryKey: eventImagesKeys.item({ id: imageId }),
    queryFn: () => fetchEventImage({ eventId, imageId }),
    enabled: !!eventId && !!imageId,
  });
};

export default useEventImage;
