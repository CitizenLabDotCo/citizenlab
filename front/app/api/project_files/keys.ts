import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = {
  type: 'file',
  variant: 'project',
};

const projectFilesKeys = {
  all: () => [baseKey],
  lists: () => [{ ...baseKey, operation: 'list' }],
  list: ({ projectId }: { projectId: string }) => [
    { ...baseKey, operation: 'list', parameters: { projectId } },
  ],
  items: () => [{ ...baseKey, operation: 'item' }],
  item: ({ projectId, fileId }: { projectId: string; fileId: string }) => [
    {
      ...baseKey,
      operation: 'item',
      parameters: { projectId, fileId },
    },
  ],
} satisfies QueryKeys;

export default projectFilesKeys;
