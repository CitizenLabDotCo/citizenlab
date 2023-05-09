import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = { type: 'user', variant: 'project_moderator' };

const projectModeratorsKeys = {
  all: () => [baseKey],
  lists: () => [{ ...baseKey, operation: 'list' }],
  list: ({ projectId }: { projectId: string }) => [
    {
      ...baseKey,
      operation: 'list',
      parameters: { projectId },
    },
  ],
} satisfies QueryKeys;

export default projectModeratorsKeys;
