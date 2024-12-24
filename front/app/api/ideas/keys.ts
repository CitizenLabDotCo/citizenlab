import { QueryKeys } from 'utils/cl-react-query/types';

import { IIdeaQueryParameters } from './types';

const baseKey = {
  type: 'idea',
};

const ideasKeys = {
  all: () => [baseKey],
  lists: () => [{ ...baseKey, operation: 'list' }],
  list: (parameters: IIdeaQueryParameters) => [
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
