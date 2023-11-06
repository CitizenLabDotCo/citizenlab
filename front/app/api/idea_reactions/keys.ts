import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = {
  type: 'reaction',
};

const ideaReactionsKeys = {
  all: () => [baseKey],
  items: () => [{ ...baseKey, operation: 'item' }],
  item: ({ id }: { id?: string }) => [
    { ...baseKey, operation: 'item', parameters: { id } },
  ],
} satisfies QueryKeys;

export default ideaReactionsKeys;
