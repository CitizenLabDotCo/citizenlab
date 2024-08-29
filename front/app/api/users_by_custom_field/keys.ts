import { QueryKeys } from 'utils/cl-react-query/types';

import { ICustomFieldParams } from './types';

const baseKey = { type: 'users_by_custom_field' };

const usersByCustomFieldKeys = {
  all: () => [baseKey],
  items: () => [{ ...baseKey, operation: 'item' }],
  item: (params: ICustomFieldParams & { id: string }) => [
    { ...baseKey, operation: 'item', parameters: params },
  ],
} satisfies QueryKeys;

export default usersByCustomFieldKeys;
