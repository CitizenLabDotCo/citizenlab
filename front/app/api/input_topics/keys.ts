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
  item: ({ projectId, id }: { projectId: string; id: string }) => [
    {
      ...baseKey,
      operation: 'item',
      parameters: { projectId, id },
    },
  ],
} satisfies QueryKeys;

export default inputTopicsKeys;
