import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = { type: 'image', variant: 'initiative' };

const initiativeImagesKeys = {
  all: () => [baseKey],
  lists: () => [{ ...baseKey, operation: 'list' }],
  list: ({ initiativeId }: { initiativeId: string }) => [
    { ...baseKey, operation: 'list', parameters: { initiativeId } },
  ],
  items: () => [{ ...baseKey, operation: 'item' }],
  item: ({ imageId }: { imageId?: string }) => [
    {
      ...baseKey,
      operation: 'item',
      parameters: { id: imageId },
    },
  ],
} satisfies QueryKeys;

export default initiativeImagesKeys;
