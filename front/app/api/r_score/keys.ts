import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = { type: 'rscore' };

const rScoreKeys = {
  all: () => [baseKey],
  items: () => [{ ...baseKey, operation: 'item' }],
  item: ({ id, projectId }: { id: string; projectId?: string }) => [
    {
      ...baseKey,
      operation: 'item',
      parameters: { id, projectId },
    },
  ],
} satisfies QueryKeys;

export default rScoreKeys;
