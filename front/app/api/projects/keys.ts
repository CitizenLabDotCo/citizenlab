import { QueryKeys } from 'utils/cl-react-query/types';
import { QueryParameters } from './types';

const baseKey = {
  type: 'project',
};

const ideasKeys = {
  all: () => [baseKey],
  lists: () => [{ ...baseKey, operation: 'list' }],
  list: (parameters: QueryParameters) => [
    { ...baseKey, operation: 'list', parameters },
  ],
  items: () => [{ ...baseKey, operation: 'item' }],
  item: ({ id, slug }: { id?: string; slug?: string }) => [
    {
      ...baseKey,
      operation: 'item',
      parameters: { id, slug },
    },
  ],
} satisfies QueryKeys;

export default ideasKeys;
