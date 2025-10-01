import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = { type: 'content_builder' };

const contentBuilderKeys = {
  all: () => [baseKey],
  items: () => [{ ...baseKey, operation: 'item' }],
  item: ({ modelId }: { modelId: string }) => [
    {
      ...baseKey,
      operation: 'item',
      parameters: { modelId },
    },
  ],
} satisfies QueryKeys;

export default contentBuilderKeys;
