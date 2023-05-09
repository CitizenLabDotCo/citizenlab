import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = { type: 'phase' };

const mentionsKeys = {
  all: () => [baseKey],
  list: ({ projectId }: { projectId: string }) => [
    { ...baseKey, operation: 'list', parameters: { projectId } },
  ],
} satisfies QueryKeys;

export default mentionsKeys;
