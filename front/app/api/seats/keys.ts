import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = {
  type: 'seats',
};

const seatsKeys = {
  all: () => [baseKey],
  items: () => [{ ...baseKey, operation: 'item' }],
} satisfies QueryKeys;

export default seatsKeys;
