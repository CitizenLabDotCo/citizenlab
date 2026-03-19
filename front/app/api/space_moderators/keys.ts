import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = { type: 'user', variant: 'space_moderator' };

const spaceModeratorsKeys = {
  all: () => [baseKey],
  lists: () => [{ ...baseKey, operation: 'list' }],
  list: ({ spaceId }: { spaceId: string }) => [
    {
      ...baseKey,
      operation: 'list',
      parameters: { spaceId },
    },
  ],
} satisfies QueryKeys;

export default spaceModeratorsKeys;
