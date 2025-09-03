import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = {
  type: 'project_library_external_comment',
};

const projectLibraryExternalCommentsKeys = {
  all: () => [baseKey],
  lists: () => [{ ...baseKey, operation: 'list' }],
  list: ({ projectId }: { projectId: string | null }) => [
    { ...baseKey, operation: 'list', parameters: { projectId } },
  ],
} satisfies QueryKeys;

export default projectLibraryExternalCommentsKeys;
