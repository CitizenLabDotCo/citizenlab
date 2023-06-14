import { QueryKeys } from 'utils/cl-react-query/types';
import { GroupsQueryParameters } from './types';

const baseKey = { type: 'group' };

const groupsKeys = {
  all: () => [baseKey],
  lists: () => [{ ...baseKey, operation: 'list' }],
  list: (params: GroupsQueryParameters) => [
    { ...baseKey, operation: 'list', parameters: params },
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

export default groupsKeys;
