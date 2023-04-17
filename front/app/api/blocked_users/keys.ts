import { QueryKeys } from 'utils/cl-react-query/types';

const blockedUsersCountKeys = {
  all: () => [{ type: 'blocked_users_count' }],
  items: () => [{ ...blockedUsersCountKeys.all()[0], operation: 'item' }],
} satisfies QueryKeys;

export default blockedUsersCountKeys;
