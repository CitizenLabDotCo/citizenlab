import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = { type: 'image', variant: 'event' };

const eventImagesKeys = {
  all: () => [baseKey],
  lists: () => [{ ...baseKey, operation: 'list' }],
  list: ({ id }: { id: string }) => [
    { ...baseKey, operation: 'list', parameters: { id } },
  ],
  items: () => [{ ...baseKey, operation: 'item' }],
  item: ({ id }: { id?: string }) => [
    {
      ...baseKey,
      operation: 'item',
      parameters: { id },
    },
  ],
} satisfies QueryKeys;

export default eventImagesKeys;
