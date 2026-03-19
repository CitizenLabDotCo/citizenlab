import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = { type: 'user', variant: 'space_moderator' };

const spaceModeratorsKeys = {
  all: () => [baseKey],
  lists: () => [{ ...baseKey, operation: 'list' }],
  list: ({ spaceId, userId }: { spaceId: string; userId?: string }) => [
    {
      ...baseKey,
      operation: 'list',
      parameters: { spaceId, userId },
    },
  ],
} satisfies QueryKeys;

export default spaceModeratorsKeys;
