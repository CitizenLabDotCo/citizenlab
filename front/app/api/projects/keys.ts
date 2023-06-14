import { QueryKeys } from 'utils/cl-react-query/types';
import { QueryParameters } from './types';

const baseKey = {
  type: 'project',
};

const projectsKeys = {
  all: () => [baseKey],
  lists: () => [{ ...baseKey, operation: 'list' }],
  list: (parameters: QueryParameters) => [
    { ...baseKey, operation: 'list', parameters },
  ],
  items: () => [{ ...baseKey, operation: 'item' }],
  item: ({ id, slug }: { id?: string | null; slug?: string | null }) => [
    {
      ...baseKey,
      operation: 'item',
      parameters: { id, slug },
    },
  ],
} satisfies QueryKeys;

export default projectsKeys;
