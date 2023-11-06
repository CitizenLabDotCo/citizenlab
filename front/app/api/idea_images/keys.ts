import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = { type: 'image' };

const ideaImagesKeys = {
  all: () => [baseKey],
  lists: () => [{ ...baseKey, operation: 'list' }],
  list: ({ ideaId }: { ideaId: string }) => [
    { ...baseKey, operation: 'list', parameters: { ideaId } },
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

export default ideaImagesKeys;
