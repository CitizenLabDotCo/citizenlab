import { QueryKeys } from 'utils/cl-react-query/types';

import { IGlobalPermissionAction } from './types';

const baseKey = { type: 'permission' };

const permissionsKeys = {
  all: () => [baseKey],
  lists: () => [{ ...baseKey, operation: 'list' }],
  items: () => [{ ...baseKey, operation: 'item' }],
  item: ({ action }: { action: IGlobalPermissionAction }) => [
    { ...baseKey, operation: 'item', parameters: { action } },
  ],
} satisfies QueryKeys;

export default permissionsKeys;
