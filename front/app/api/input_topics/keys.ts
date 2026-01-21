import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = { type: 'input_topic' };

const inputTopicsKeys = {
  all: () => [baseKey],
  lists: () => [{ ...baseKey, operation: 'list' }],
  list: ({
    projectId,
    sort,
  }: {
    projectId: string;
    sort?: 'custom' | 'ideas_count' | '-ideas_count';
  }) => [{ ...baseKey, operation: 'list', parameters: { projectId, sort } }],
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
