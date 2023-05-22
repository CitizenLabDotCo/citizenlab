import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = {
  type: 'user',
};

const meKeys = {
  all: () => [baseKey],
  items: () => [{ ...baseKey, operation: 'item' }],
} satisfies QueryKeys;

export default meKeys;
