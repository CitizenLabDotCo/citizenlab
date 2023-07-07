import { QueryKeys } from 'utils/cl-react-query/types';
import { InputParameters } from './types';

const baseKey = {
  type: 'baskets_idea',
};

const basketsIdeasKeys = {
  all: () => [baseKey],
  list: (parameters: InputParameters) => [
    { ...baseKey, operation: 'list', parameters },
  ],
  items: () => [{ ...baseKey, operation: 'item' }],
  item: ({ id }: { id?: string }) => [
    { ...baseKey, operation: 'item', parameters: { id } },
  ],
} satisfies QueryKeys;

export default basketsIdeasKeys;
