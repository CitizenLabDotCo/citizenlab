import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = { type: 'follower' };

const followUnfollowKeys = {
  all: () => [baseKey],
  items: () => [{ ...baseKey, operation: 'item' }],
  item: ({ id }: { id: string }) => [
    {
      ...baseKey,
      operation: 'item',
      parameters: { id },
    },
  ],
} satisfies QueryKeys;

export default followUnfollowKeys;
