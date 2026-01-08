import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = { type: 'input_topic' };

const inputTopicsKeys = {
  all: () => [baseKey],
  lists: () => [{ ...baseKey, operation: 'list' }],
  list: ({ projectId }: { projectId: string }) => [
    { ...baseKey, operation: 'list', parameters: { projectId } },
  ],
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
