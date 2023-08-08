import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = {
  type: 'baskets_idea',
};

const basketsIdeasKeys = {
  all: () => [baseKey],
  items: () => [{ ...baseKey, operation: 'item' }],
  item: ({ basketId }: { basketId?: string }) => [
    { ...baseKey, operation: 'item', parameters: { basketId } },
  ],
} satisfies QueryKeys;

export default basketsIdeasKeys;
