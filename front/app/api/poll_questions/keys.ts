import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = { type: 'question' };

const pollQuestionsKeys = {
  all: () => [baseKey],
  lists: () => [{ ...baseKey, operation: 'list' }],
  list: ({ phaseId }: { phaseId: string }) => [
    {
      ...baseKey,
      operation: 'list',
      parameters: { phaseId },
    },
  ],
} satisfies QueryKeys;

export default pollQuestionsKeys;
