import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = {
  type: 'basket',
};

const basketsKeys = {
  all: () => [baseKey],
  items: () => [{ ...baseKey, operation: 'item' }],
  item: ({ id }: { id?: string }) => [
    { ...baseKey, operation: 'item', parameters: { id } },
  ],
} satisfies QueryKeys;

export default basketsKeys;
