import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = { type: 'option' };

const pollOptionsKeys = {
  all: () => [baseKey],
  lists: () => [{ ...baseKey, operation: 'list' }],
  list: ({ questionId }: { questionId?: string }) => [
    { ...baseKey, operation: 'list', parameters: { id: questionId } },
  ],
} satisfies QueryKeys;

export default pollOptionsKeys;
