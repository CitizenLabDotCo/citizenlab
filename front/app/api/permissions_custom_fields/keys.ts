import { QueryKeys } from 'utils/cl-react-query/types';
import { IItemParameters, IListParameters } from './types';

const baseKey = { type: 'permissions_custom_field' };

const permissionsCustomFieldsKeys = {
  all: () => [baseKey],
  lists: () => [{ ...baseKey, operation: 'list' }],
  list: (parameters: IListParameters) => [
    { ...baseKey, operation: 'list', parameters },
  ],
  items: () => [{ ...baseKey, operation: 'item' }],
  item: (parameters: IItemParameters) => [
    { ...baseKey, operation: 'item', parameters },
  ],
} satisfies QueryKeys;

export default permissionsCustomFieldsKeys;
