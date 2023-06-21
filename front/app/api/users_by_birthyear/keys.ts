import { ICustomFieldParams } from 'api/users_by_custom_field/types';
import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = { type: 'users_by_birthyear' };

const usersByBirthyearKeys = {
  all: () => [baseKey],
  items: () => [{ ...baseKey, operation: 'item' }],
  item: (params: ICustomFieldParams) => [
    { ...baseKey, operation: 'item', parameters: params },
  ],
} satisfies QueryKeys;

export default usersByBirthyearKeys;
