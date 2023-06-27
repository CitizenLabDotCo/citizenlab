import { IQueryParameters } from './types';
import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = { type: 'custom_field' };

const userCustomFieldsKeys = {
  all: () => [baseKey],
  lists: () => [{ ...baseKey, operation: 'list' }],
  list: (queryParameters?: IQueryParameters) => [
    { ...baseKey, operation: 'list', parameters: { ...queryParameters } },
  ],
  items: () => [{ ...baseKey, operation: 'item' }],
  item: ({ customFieldId }: { customFieldId?: string }) => [
    { ...baseKey, operation: 'item', parameters: { customFieldId } },
  ],
} satisfies QueryKeys;

export default userCustomFieldsKeys;
