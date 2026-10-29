import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = { type: 'admin_search' };

const adminSearchKeys = {
  all: () => [baseKey],
} satisfies QueryKeys;

export default adminSearchKeys;
