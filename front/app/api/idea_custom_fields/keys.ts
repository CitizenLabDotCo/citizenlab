import { IQueryParameters } from './types';
import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = { type: 'custom_field' };

const ideaCustomFieldsKeys = {
  all: () => [baseKey],
  lists: () => [{ ...baseKey, operation: 'list' }],
  list: (queryParameters?: IQueryParameters) => [
    { ...baseKey, operation: 'list', parameters: { ...queryParameters } },
  ],
  items: () => [{ ...baseKey, operation: 'item' }],
  item: ({ customFieldId }: { customFieldId?: string }) => [
    { ...baseKey, operation: 'item', parameters: { id: customFieldId } },
  ],
} satisfies QueryKeys;

export default ideaCustomFieldsKeys;
