import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = { type: 'email_bounced_users_count' };

const emailBouncedUsersCountKeys = {
  all: () => [baseKey],
  items: () => [{ ...baseKey, operation: 'item' }],
} satisfies QueryKeys;

export default emailBouncedUsersCountKeys;
