import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = { type: 'permission' };

const permissionsKeys = {
  all: () => [baseKey],
  lists: () => [{ ...baseKey, operation: 'list' }],
} satisfies QueryKeys;

export default permissionsKeys;
