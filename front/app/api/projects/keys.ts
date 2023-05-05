import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = { type: 'project' };

const projectsKeys = {
  all: () => [baseKey],
  item: ({ id }: { id: string }) => [
    {
      ...baseKey,
      operation: 'item',
      parameters: { id },
    },
  ],
} satisfies QueryKeys;

export default projectsKeys;
