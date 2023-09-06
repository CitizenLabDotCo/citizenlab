import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = { type: 'background_task' };

const backgroundTasksKeys = {
  all: () => [baseKey],
  lists: () => [{ ...baseKey, operation: 'list' }],
  list: ({ analysisId }: { analysisId: string }) => [
    { ...baseKey, operation: 'list', parameters: { analysisId } },
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

export default backgroundTasksKeys;
