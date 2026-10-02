import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = { type: 'responses_count' };

const pollReponsesKeys = {
  all: () => [baseKey],
  items: () => [{ ...baseKey, operation: 'item' }],
  item: ({ phaseId }: { phaseId: string | null }) => [
    {
      ...baseKey,
      operation: 'item',
      parameters: { phaseId },
    },
  ],
} satisfies QueryKeys;

export default pollReponsesKeys;
