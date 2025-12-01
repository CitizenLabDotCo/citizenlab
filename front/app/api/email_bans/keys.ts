import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = { type: 'email_ban' };

const emailBansKeys = {
  all: () => [baseKey],
  items: () => [{ ...baseKey, operation: 'item' }],
} satisfies QueryKeys;

export default emailBansKeys;
