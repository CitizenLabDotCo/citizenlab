import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = { type: 'image', variant: 'project' };

const projectImagesKeys = {
  all: () => [baseKey],
  lists: () => [{ ...baseKey, operation: 'list' }],
  list: ({ projectId }: { projectId: string | null }) => [
    { ...baseKey, operation: 'list', parameters: { projectId } },
  ],
} satisfies QueryKeys;

export default projectImagesKeys;
