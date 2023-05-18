import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = {
  type: 'users_count',
};

const userCountKeys = {
  all: () => [baseKey],
  items: () => [{ ...baseKey, operation: 'item' }],
} satisfies QueryKeys;

export default userCountKeys;
