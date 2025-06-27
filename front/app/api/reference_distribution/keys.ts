import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = { type: 'reference_distribution' };

const referenceDistributionKeys = {
  all: () => [baseKey],
  items: () => [{ ...baseKey, operation: 'item' }],
  item: ({ id }: { id: string }) => [
    {
      ...baseKey,
      operation: 'item',
      parameters: { id },
    },
  ],
} satisfies QueryKeys;

export default referenceDistributionKeys;
