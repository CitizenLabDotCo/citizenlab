import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = { type: 'blocked_users_count' };

const blockedUsersCountKeys = {
  all: () => [baseKey],
  items: () => [{ ...baseKey, operation: 'item' }],
} satisfies QueryKeys;

export default blockedUsersCountKeys;
