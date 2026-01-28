import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = { type: 'input_topic' };

const inputTopicsKeys = {
  all: () => [baseKey],
  lists: () => [{ ...baseKey, operation: 'list' }],
  list: (filters) => [{ ...baseKey, operation: 'list', parameters: filters }],
  items: () => [{ ...baseKey, operation: 'item' }],
  item: ({ id }: { id: string }) => [
    {
      ...baseKey,
      operation: 'item',
      parameters: { id },
    },
  ],
} satisfies QueryKeys;

export default inputTopicsKeys;
