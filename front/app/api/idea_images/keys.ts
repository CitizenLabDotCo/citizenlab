import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = { type: 'image', variant: 'idea' };

const ideaImagesKeys = {
  all: () => [baseKey],
  lists: () => [{ ...baseKey, operation: 'list' }],
  list: ({ ideaId }: { ideaId: string }) => [
    { ...baseKey, operation: 'list', parameters: { ideaId } },
  ],
  items: () => [{ ...baseKey, operation: 'item' }],
  item: ({ ideaId, imageId }: { ideaId: string; imageId: string }) => [
    {
      ...baseKey,
      operation: 'item',
      parameters: { ideaId, imageId },
    },
  ],
} satisfies QueryKeys;

export default ideaImagesKeys;
