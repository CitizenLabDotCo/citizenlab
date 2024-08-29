import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = {
  type: 'file',
  variant: 'project',
};

const projectFilesKeys = {
  all: () => [baseKey],
  lists: () => [{ ...baseKey, operation: 'list' }],
  list: ({ projectId }: { projectId: string | null }) => [
    { ...baseKey, operation: 'list', parameters: { projectId } },
  ],
} satisfies QueryKeys;

export default projectFilesKeys;
