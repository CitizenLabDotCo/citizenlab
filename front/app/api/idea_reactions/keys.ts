import { QueryKeys } from 'utils/cl-react-query/types';

const itemKey = { type: 'reaction' };
const baseKey = { type: 'reaction', variant: 'idea' };

const ideaReactionsKeys = {
  all: () => [baseKey],
  items: () => [{ ...baseKey, operation: 'item' }],
  item: ({ id }: { id?: string }) => [
    { ...itemKey, operation: 'item', parameters: { id } },
  ],
} satisfies QueryKeys;

export default ideaReactionsKeys;
