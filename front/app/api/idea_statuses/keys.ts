import { QueryKeys } from 'utils/cl-react-query/types';

import { IdeaStatusesQueryParams } from './types';

const baseKey = {
  type: 'idea_status',
};

const ideaStatusesKeys = {
  all: () => [baseKey],
  lists: () => [{ ...baseKey, operation: 'list' }],
  list: (parameters: IdeaStatusesQueryParams) => [
    { ...baseKey, operation: 'list', parameters },
  ],
  items: () => [{ ...baseKey, operation: 'item' }],
  item: ({ id }: { id: string }) => [
    {
      ...baseKey,
      operation: 'item',
      parameters: { id },
    },
  ],
} satisfies QueryKeys;

export default ideaStatusesKeys;
