import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = { type: 'userjot_identity' };

const userjotIdentityKeys = {
  all: () => [baseKey],
  items: () => [{ ...baseKey, operation: 'item' }],
  item: ({ userId }: { userId?: string }) => [
    { ...baseKey, operation: 'item', parameters: { userId } },
  ],
} satisfies QueryKeys;

export default userjotIdentityKeys;
