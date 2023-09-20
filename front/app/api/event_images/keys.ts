import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = { type: 'image', variant: 'event' };

const eventImagesKeys = {
  all: () => [baseKey],
  lists: () => [{ ...baseKey, operation: 'list' }],
  list: ({ eventId }: { eventId: string }) => [
    { ...baseKey, operation: 'list', parameters: { eventId } },
  ],
  items: () => [{ ...baseKey, operation: 'item' }],
  item: ({ eventId, imageId }: { eventId?: string; imageId?: string }) => [
    {
      ...baseKey,
      operation: 'item',
      parameters: { eventId, imageId },
    },
  ],
} satisfies QueryKeys;

export default eventImagesKeys;
