import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = { type: 'custom_field_option' };

const userCustomFieldsOptionsKeys = {
  all: () => [baseKey],
  lists: () => [{ ...baseKey, operation: 'list' }],
  list: ({ customFieldId }: { customFieldId?: string }) => [
    { ...baseKey, operation: 'list', parameters: { customFieldId } },
  ],
} satisfies QueryKeys;

export default userCustomFieldsOptionsKeys;
