import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = { type: 'custom_field_option' };

const userCustomFieldsOptionsKeys = {
  all: () => [baseKey],
  lists: () => [{ ...baseKey, operation: 'list' }],
  list: ({ customFieldId }: { customFieldId?: string }) => [
    { ...baseKey, operation: 'list', parameters: { customFieldId } },
  ],
  items: () => [{ ...baseKey, operation: 'item' }],
  item: ({ optionId }: { customFieldId?: string; optionId: string }) => [
    { ...baseKey, operation: 'item', parameters: { id: optionId } },
  ],
} satisfies QueryKeys;

export default userCustomFieldsOptionsKeys;
