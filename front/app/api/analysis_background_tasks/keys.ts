import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = { type: 'analysis_background_task' };

const backgroundTasksKeys = {
  all: () => [baseKey],
  lists: () => [{ ...baseKey, operation: 'list' }],
  list: ({ analysisId }: { analysisId: string }) => [
    { ...baseKey, operation: 'list', parameters: { analysisId } },
  ],
  items: () => [{ ...baseKey, operation: 'item' }],
  item: ({ analysisId, id }: { analysisId: string; id: string }) => [
    {
      ...baseKey,
      operation: 'item',
      parameters: { id, analysisId },
    },
  ],
} satisfies QueryKeys;

export default backgroundTasksKeys;
