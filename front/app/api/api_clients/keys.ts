import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = { type: 'area' };

const apiClientKeys = {
  all: () => [baseKey],
  lists: () => [{ ...baseKey, operation: 'list' }],
} satisfies QueryKeys;

export default apiClientKeys;
