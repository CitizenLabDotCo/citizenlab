import { QueryKeys } from 'utils/cl-react-query/types';

import { Parameters } from './types';

const baseKey = {
  type: 'project_mini_admin',
};

const miniProjectsKeys = {
  all: () => [baseKey],
  lists: () => [{ ...baseKey, operation: 'list' }],
  list: (parameters: Parameters) => [
    { ...baseKey, operation: 'list', parameters },
  ],
  item: ({ id }: { id?: string }) => [
    {
      ...baseKey,
      operation: 'item',
      parameters: { id },
    },
  ],
} satisfies QueryKeys;

export default miniProjectsKeys;
